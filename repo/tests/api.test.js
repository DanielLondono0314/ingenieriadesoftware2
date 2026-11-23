// Pruebas de integración del backend (Jest + Supertest) contra PostgreSQL creada con el DDL (E11).
// Requiere una BD con el DDL y los seeds (p. ej. DB_NAME=ia_k12_dev). Correos únicos por ejecución.
// Autenticación real: cada prueba usa el JWT del rol que corresponde (RF-005, RF-006).
process.env.SECURITY_LOG = require('path').join(require('os').tmpdir(), 'seguridad-test.log');
process.env.REPORTES_DIR = require('path').join(require('os').tmpdir(), 'reportes-test');
process.env.LOGIN_MAX_INTENTOS = '5';

const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../src/server');
const { sequelize, Usuario } = require('../src/models');
const { reiniciar } = require('../src/services/authService');

const sufijo = Date.now();
const correo = (n) => `${n}-${sufijo}@test.edu.co`;
const CLAVE = 'Clave1234';
const usuarioBase = (n, id_rol = 1) => ({ nombre: n, apellido: 'Test', correo: correo(n), contrasena: CLAVE, id_rol, id_nivel: 1 });
const ctx = {};

// Cliente HTTP que adjunta el token (o ninguno).
const as = (token) => {
  const h = (req) => (token ? req.set('Authorization', `Bearer ${token}`) : req);
  return {
    get: (u) => h(request(app).get(u)),
    post: (u, b) => h(request(app).post(u)).send(b),
    put: (u, b) => h(request(app).put(u)).send(b),
    del: (u) => h(request(app).delete(u)),
  };
};
const login = async (n) => (await request(app).post('/api/auth/login').send({ correo: correo(n), contrasena: CLAVE })).body.token;

beforeAll(async () => {
  for (const [n, rol] of [['adm', 3], ['doc', 2], ['est', 1], ['est2', 1]]) {
    ctx[n] = (await Usuario.create({ ...usuarioBase(n, rol) })).toJSON();
  }
  ctx.tA = await login('adm'); ctx.tD = await login('doc'); ctx.tE = await login('est'); ctx.tE2 = await login('est2');
  ctx.A = as(ctx.tA); ctx.D = as(ctx.tD); ctx.E = as(ctx.tE); ctx.E2 = as(ctx.tE2); ctx.anon = as(null);

  ctx.mod = (await ctx.D.post('/api/modulos', {
    titulo: 'Mod test', descripcion: 'd', id_tipo_contenido: 1, id_nivel: 1, id_docente: ctx.doc.id_usuario,
  })).body;
  ctx.act = (await ctx.D.post('/api/actividades', {
    titulo: 'Quiz test', descripcion: 'd', id_tipo_actividad: 1, id_modulo: ctx.mod.id_modulo, id_docente: ctx.doc.id_usuario,
    instrucciones: 'i', criterio_evaluacion: 'c', puntaje_maximo: 100,
  })).body;
  ctx.preguntas = [];
  for (const n of [1, 2]) {
    const p = (await ctx.D.post('/api/preguntas', { id_actividad: ctx.act.id_actividad, enunciado: `P${n}`, orden: n, retroalimentacion: `fb${n}` })).body;
    const ok = (await ctx.D.post('/api/opciones', { id_pregunta: p.id_pregunta, texto: 'ok', es_correcta: true, orden: 1 })).body;
    const mal = (await ctx.D.post('/api/opciones', { id_pregunta: p.id_pregunta, texto: 'mal', es_correcta: false, orden: 2 })).body;
    ctx.preguntas.push({ p, ok, mal });
  }
});

afterAll(async () => { await sequelize.close(); });
beforeEach(() => reiniciar());

// Crea un estudiante nuevo y su progreso sobre la actividad de prueba.
const nuevoEstudianteConProgreso = async (n) => {
  const u = (await ctx.A.post('/api/usuarios', usuarioBase(n))).body;
  const token = await login(n);
  const prog = (await as(token).post('/api/progresos', { id_actividad: ctx.act.id_actividad })).body;
  return { u, token, E: as(token), id: prog.id_progreso };
};

describe('Salud, catálogos y 404', () => {
  test('GET /api/health es público', async () => {
    const r = await ctx.anon.get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.db).toBe('connected');
  });
  test('GET /api devuelve metadatos', async () => {
    expect((await ctx.anon.get('/api')).body.nombre).toBe('IA-K12 Backend');
  });
  test.each(['roles', 'niveles-educativos', 'tipos-contenido', 'tipos-actividad', 'instituciones'])('GET /api/%s con sesión trae datos', async (ep) => {
    const r = await ctx.E.get(`/api/${ep}`);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
  });
  test('rutas y recursos inexistentes → 404', async () => {
    expect((await ctx.A.get('/api/no-existe')).status).toBe(404);
    expect((await ctx.A.get('/api/usuarios/9999999')).status).toBe(404);
  });
});

describe('RF-005 / RF-006 — autenticación y roles', () => {
  test.each(['usuarios', 'modulos', 'actividades', 'progresos', 'historiales', 'reportes', 'notificaciones', 'roles', 'preguntas', 'opciones', 'matriculas'])(
    'GET /api/%s sin token → 401', async (ep) => {
      expect((await ctx.anon.get(`/api/${ep}`)).status).toBe(401);
    });
  test('token inválido → 401', async () => {
    expect((await as('no.es.un.jwt').get('/api/modulos')).status).toBe(401);
  });
  test('matriz por rol en lecturas', async () => {
    expect((await ctx.E.get('/api/usuarios')).status).toBe(403);
    expect((await ctx.D.get('/api/usuarios')).status).toBe(200);
    expect((await ctx.A.get('/api/usuarios')).status).toBe(200);
    expect((await ctx.E.get('/api/reportes')).status).toBe(403);
    expect((await ctx.D.get('/api/reportes')).status).toBe(200);
    expect((await ctx.E.get('/api/matriculas')).status).toBe(403);
    expect((await ctx.D.get('/api/matriculas')).status).toBe(200);
    expect((await ctx.E.get('/api/modulos')).status).toBe(200);
  });
  test('matriz por rol en escrituras', async () => {
    const mod = { titulo: 'x', descripcion: 'd', id_tipo_contenido: 1, id_nivel: 1, id_docente: ctx.doc.id_usuario };
    expect((await ctx.E.post('/api/modulos', mod)).status).toBe(403);
    expect((await ctx.D.post('/api/modulos', mod)).status).toBe(201);
    expect((await ctx.D.post('/api/roles', { nombre_rol: 'X' })).status).toBe(403);
    expect((await ctx.D.post('/api/niveles-educativos', { nombre_nivel: 'x', rango_grado: '1' })).status).toBe(403);
    expect((await ctx.D.del(`/api/usuarios/${ctx.est2.id_usuario}`)).status).toBe(403);
    expect((await ctx.E.del(`/api/modulos/${ctx.mod.id_modulo}`)).status).toBe(403);
    expect((await ctx.E.put(`/api/actividades/${ctx.act.id_actividad}`, { titulo: 'hack' })).status).toBe(403);
  });
  test('el estudiante solo ve sus progresos, historiales y notificaciones', async () => {
    const a = await nuevoEstudianteConProgreso('prop1');
    const b = await nuevoEstudianteConProgreso('prop2');
    const listaA = (await a.E.get('/api/progresos')).body;
    expect(listaA.length).toBeGreaterThan(0);
    expect(listaA.every((p) => p.id_estudiante === a.u.id_usuario)).toBe(true);
    expect((await a.E.get(`/api/progresos/${b.id}`)).status).toBe(403);
    expect((await a.E.get(`/api/progresos/${a.id}`)).status).toBe(200);
    expect((await ctx.D.get('/api/progresos')).body.length).toBeGreaterThanOrEqual(2);
    // historiales y notificaciones propias
    const h = await a.E.post('/api/historiales', {
      id_estudiante: b.u.id_usuario, id_modulo: ctx.mod.id_modulo, fecha_inicio: new Date(), fecha_fin: new Date(),
      puntaje_total: 10, actividades_completadas: 1, modulo_aprobado: true,
    });
    expect(h.status).toBe(201);
    expect(h.body.id_estudiante).toBe(a.u.id_usuario); // se fuerza al dueño del token
    expect((await b.E.get('/api/historiales')).body.some((x) => x.id_historial === h.body.id_historial)).toBe(false);
    expect((await b.E.get(`/api/historiales/${h.body.id_historial}`)).status).toBe(403);
    // RF-021: solo el administrador elimina historial (docente y estudiante → 403)
    expect((await ctx.D.del(`/api/historiales/${h.body.id_historial}`)).status).toBe(403);
    expect((await a.E.del(`/api/historiales/${h.body.id_historial}`)).status).toBe(403);
    expect((await ctx.A.del(`/api/historiales/${h.body.id_historial}`)).status).toBe(204);
    const n = (await a.E.post('/api/notificaciones', { id_usuario: b.u.id_usuario, tipo: 't', mensaje: 'm' })).body;
    expect(n.id_usuario).toBe(a.u.id_usuario);
    expect((await b.E.get('/api/notificaciones')).body.some((x) => x.id_notificacion === n.id_notificacion)).toBe(false);
    expect((await b.E.put(`/api/notificaciones/${n.id_notificacion}`, { leida: true })).status).toBe(403);
    expect((await a.E.put(`/api/notificaciones/${n.id_notificacion}`, { leida: true })).status).toBe(200);
  });
  test('el docente notifica a un estudiante; un estudiante no ve la de otro', async () => {
    const n = await ctx.D.post('/api/notificaciones', { id_usuario: ctx.est.id_usuario, tipo: 'aviso', mensaje: 'hola' });
    expect(n.status).toBe(201);
    expect(n.body.id_usuario).toBe(ctx.est.id_usuario);
    expect((await ctx.E.get('/api/notificaciones')).body.some((x) => x.id_notificacion === n.body.id_notificacion)).toBe(true);
    expect((await ctx.E2.get('/api/notificaciones')).body.some((x) => x.id_notificacion === n.body.id_notificacion)).toBe(false);
    expect((await ctx.A.get('/api/notificaciones')).body.some((x) => x.id_notificacion === n.body.id_notificacion)).toBe(true);
    expect((await ctx.D.get('/api/notificaciones')).body.some((x) => x.id_notificacion === n.body.id_notificacion)).toBe(false);
  });
  test('responder/completar solo el progreso propio', async () => {
    const a = await nuevoEstudianteConProgreso('own1');
    const b = await nuevoEstudianteConProgreso('own2');
    const resp = [{ id_pregunta: ctx.preguntas[0].p.id_pregunta, id_opcion: ctx.preguntas[0].ok.id_opcion }];
    expect((await b.E.post(`/api/progresos/${a.id}/responder`, { respuestas: resp })).status).toBe(403);
    expect((await b.E.post(`/api/progresos/${a.id}/completar`, { puntaje: 10 })).status).toBe(403);
    expect((await a.E.post(`/api/progresos/${a.id}/responder`, { respuestas: resp })).status).toBe(200);
    expect((await ctx.D.post(`/api/progresos/${b.id}/completar`, { puntaje: 10 })).status).toBe(200);
  });
  test('usuarios: el estudiante ve solo su cuenta; el docente solo edita la suya', async () => {
    expect((await ctx.E.get(`/api/usuarios/${ctx.est.id_usuario}`)).status).toBe(200);
    expect((await ctx.E.get(`/api/usuarios/${ctx.est2.id_usuario}`)).status).toBe(403);
    expect((await ctx.D.get(`/api/usuarios/${ctx.est2.id_usuario}`)).status).toBe(200);
    expect((await ctx.D.put(`/api/usuarios/${ctx.est2.id_usuario}`, { nombre: 'x' })).status).toBe(403);
    expect((await ctx.D.put(`/api/usuarios/${ctx.doc.id_usuario}`, { nombre: 'Doc2' })).status).toBe(200);
  });
  test('nadie se auto-eleva: id_rol y estado se ignoran salvo para el administrador', async () => {
    const r = await ctx.E.put(`/api/usuarios/${ctx.est.id_usuario}`, { id_rol: 3, estado: 'inactivo', apellido: 'Nuevo' });
    expect(r.status).toBe(200);
    expect(r.body.id_rol).toBe(1);
    expect(r.body.estado).toBe('activo');
    expect(r.body.apellido).toBe('Nuevo');
    const adm = await ctx.A.put(`/api/usuarios/${ctx.est2.id_usuario}`, { id_nivel: 2 });
    expect(adm.status).toBe(200);
  });
  test('reportes generados solo descargables con sesión docente/administrador', async () => {
    const r = await ctx.D.post('/api/reportes/generar', { tipo: 'global', formato: 'PDF', rango: 'r' });
    const url = r.body.contenido_url;
    expect((await ctx.anon.get(url)).status).toBe(401);
    expect((await ctx.E.get(url)).status).toBe(403);
    expect((await ctx.D.get(url)).status).toBe(200);
  });
});

describe('RF-001 / RNF-004 / RNF-015 — usuarios', () => {
  test('auto-registro público fuerza rol estudiante y estado activo', async () => {
    const r = await ctx.anon.post('/api/usuarios', { ...usuarioBase('self'), id_rol: 3, estado: 'pendiente' });
    expect(r.status).toBe(201);
    expect(r.body.id_rol).toBe(1);
    expect(r.body.estado).toBe('activo');
  });
  test('el administrador sí puede crear docentes', async () => {
    const r = await ctx.A.post('/api/usuarios', usuarioBase('nuevodoc', 2));
    expect(r.status).toBe(201);
    expect(r.body.id_rol).toBe(2);
  });
  test('la respuesta no expone la contraseña y se guarda con bcrypt', async () => {
    expect(ctx.est.contrasena).toBeUndefined();
    const [rows] = await sequelize.query('SELECT contrasena FROM usuario WHERE id_usuario = :id', { replacements: { id: ctx.est.id_usuario } });
    expect(rows[0].contrasena).toMatch(/^\$2[aby]\$12\$/);
  });
  test('correo duplicado → 409 (BUG-01)', async () => {
    expect((await ctx.anon.post('/api/usuarios', usuarioBase('est'))).status).toBe(409);
  });
  test('campos obligatorios y CHECK → 400', async () => {
    expect((await ctx.anon.post('/api/usuarios', { nombre: 'x' })).status).toBe(400);
    expect((await ctx.A.post('/api/instituciones', { nombre: 'a', municipio: 'b', tipo: 'Oficial' })).status).toBe(400);
    expect((await ctx.A.post('/api/instituciones', { nombre: 'a', municipio: 'b', tipo: 'publica' })).status).toBe(201);
  });
  test('FK inexistente → 409', async () => {
    const r = await ctx.D.post('/api/modulos', { titulo: 't', descripcion: 'd', id_tipo_contenido: 9999, id_nivel: 1, id_docente: ctx.doc.id_usuario });
    expect(r.status).toBe(409);
  });
});

describe('RF-005 / RNF-005 — login y bloqueo', () => {
  const post = (b) => request(app).post('/api/auth/login').send(b);
  test('login correcto devuelve token y usuario sin contraseña', async () => {
    const r = await post({ correo: correo('est'), contrasena: CLAVE });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeTruthy();
    expect(r.body.usuario.contrasena).toBeUndefined();
  });
  test('faltan datos → 400; correo inexistente o clave mala → 401', async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ correo: 'no@no.co', contrasena: 'x' })).status).toBe(401);
    expect((await post({ correo: correo('est'), contrasena: 'mala' })).status).toBe(401);
  });
  test('5 intentos fallidos bloquean la cuenta (423) incluso con la clave correcta', async () => {
    const u = (await ctx.anon.post('/api/usuarios', usuarioBase('bloq'))).body;
    for (let i = 1; i <= 4; i += 1) expect((await post({ correo: correo('bloq'), contrasena: 'mala' })).status).toBe(401);
    expect((await post({ correo: correo('bloq'), contrasena: 'mala' })).status).toBe(423);
    expect((await post({ correo: correo('bloq'), contrasena: CLAVE })).status).toBe(423);
    expect((await ctx.A.get(`/api/usuarios/${u.id_usuario}`)).body.estado).toBe('bloqueado_temporal');
    expect(fs.readFileSync(process.env.SECURITY_LOG, 'utf8')).toContain(`BLOQUEO ${correo('bloq')}`);
  });
  test('el bloqueo vencido se levanta', async () => {
    const u = (await ctx.anon.post('/api/usuarios', usuarioBase('venc'))).body;
    await sequelize.query("UPDATE usuario SET estado = 'bloqueado_temporal' WHERE id_usuario = :id", { replacements: { id: u.id_usuario } });
    expect((await post({ correo: correo('venc'), contrasena: CLAVE })).status).toBe(200);
  });
  test('cuenta inactiva → 403', async () => {
    const u = (await ctx.anon.post('/api/usuarios', usuarioBase('inact'))).body;
    await ctx.A.del(`/api/usuarios/${u.id_usuario}`);
    expect((await post({ correo: correo('inact'), contrasena: CLAVE })).status).toBe(403);
  });
});

describe('Configuración del JWT (RNF-004)', () => {
  const { secreto } = require('../src/config/jwt');
  test('JWT_SECRET es obligatorio en producción', () => {
    const prev = { s: process.env.JWT_SECRET, e: process.env.NODE_ENV };
    delete process.env.JWT_SECRET; process.env.NODE_ENV = 'production';
    expect(() => secreto()).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = 'otro'; expect(secreto()).toBe('otro');
    if (prev.s === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = prev.s;
    process.env.NODE_ENV = prev.e;
  });
  test('token expirado → 401', async () => {
    const jwt = require('jsonwebtoken');
    const t = jwt.sign({ sub: ctx.est.id_usuario, rol: 1 }, secreto(), { expiresIn: -10 });
    expect((await as(t).get('/api/modulos')).status).toBe(401);
  });
});

describe('Regla 1 — completar progreso (E14-DE02)', () => {
  let a;
  beforeAll(async () => { a = await nuevoEstudianteConProgreso('reg1'); });
  test('puntaje fuera de rango → 422, válido → 200, repetir → 409, inexistente → 404', async () => {
    expect((await a.E.post(`/api/progresos/${a.id}/completar`, { puntaje: 999 })).status).toBe(422);
    expect((await a.E.post(`/api/progresos/${a.id}/completar`, { puntaje: 85 })).status).toBe(200);
    expect((await a.E.post(`/api/progresos/${a.id}/completar`, { puntaje: 50 })).status).toBe(409);
    expect((await ctx.D.post('/api/progresos/9999999/completar', { puntaje: 1 })).status).toBe(404);
  });
  test('al completar se crea la notificación automática (GAP-02)', async () => {
    const n = (await a.E.get('/api/notificaciones')).body.filter((x) => x.tipo === 'actividad_calificada');
    expect(n.length).toBe(1);
    expect(n[0].leida).toBe(false);
  });
});

describe('Regla 2 — desactivar usuario (E14-DE03)', () => {
  test('soft-delete: 200, oculto del listado, accesible por id, 409 al repetir, 404 inexistente', async () => {
    const u = (await ctx.anon.post('/api/usuarios', usuarioBase('soft'))).body;
    const r = await ctx.A.del(`/api/usuarios/${u.id_usuario}`);
    expect(r.status).toBe(200);
    expect(r.body.estado).toBe('inactivo');
    expect((await ctx.A.get('/api/usuarios')).body.some((x) => x.id_usuario === u.id_usuario)).toBe(false);
    expect((await ctx.A.get(`/api/usuarios/${u.id_usuario}`)).status).toBe(200);
    expect((await ctx.A.del(`/api/usuarios/${u.id_usuario}`)).status).toBe(409);
    expect((await ctx.A.del('/api/usuarios/9999999')).status).toBe(404);
  });
});

describe('CU-001 / GAP-01 — responder actividad (evaluación automática)', () => {
  test('GET /actividades/:id/preguntas devuelve opciones ordenadas', async () => {
    const r = await ctx.E.get(`/api/actividades/${ctx.act.id_actividad}/preguntas`);
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(2);
    expect(r.body[0].opciones).toHaveLength(2);
    expect((await ctx.anon.get(`/api/actividades/${ctx.act.id_actividad}/preguntas`)).status).toBe(401);
  });
  test('1 de 2 correctas → puntaje 50 sobre 100 con retroalimentación por pregunta', async () => {
    const { E, id } = await nuevoEstudianteConProgreso('resp1');
    const [a, b] = ctx.preguntas;
    const r = await E.post(`/api/progresos/${id}/responder`, {
      respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: a.ok.id_opcion }, { id_pregunta: b.p.id_pregunta, id_opcion: b.mal.id_opcion }],
    });
    expect(r.status).toBe(200);
    expect(r.body.puntaje).toBe(50);
    expect(r.body.aciertos).toBe(1);
    expect(r.body.progreso.estado).toBe('completado');
    expect(r.body.detalle[0].retroalimentacion).toBe('fb1');
  });
  test('todas correctas → 100', async () => {
    const { E, id } = await nuevoEstudianteConProgreso('resp2');
    const r = await E.post(`/api/progresos/${id}/responder`, {
      respuestas: ctx.preguntas.map((x) => ({ id_pregunta: x.p.id_pregunta, id_opcion: x.ok.id_opcion })),
    });
    expect(r.body.puntaje).toBe(100);
  });
  test('validaciones: vacío 422, opción ajena 422, repetir 409, progreso inexistente 404', async () => {
    const { E, id } = await nuevoEstudianteConProgreso('resp3');
    const [a, b] = ctx.preguntas;
    expect((await E.post(`/api/progresos/${id}/responder`, { respuestas: [] })).status).toBe(422);
    expect((await E.post(`/api/progresos/${id}/responder`, { respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: b.ok.id_opcion }] })).status).toBe(422);
    expect((await E.post(`/api/progresos/${id}/responder`, { respuestas: [{ id_pregunta: 9999999, id_opcion: 1 }] })).status).toBe(422);
    await E.post(`/api/progresos/${id}/responder`, { respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: a.ok.id_opcion }] });
    expect((await E.post(`/api/progresos/${id}/responder`, { respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: a.ok.id_opcion }] })).status).toBe(409);
    expect((await E.post('/api/progresos/9999999/responder', { respuestas: [{ id_pregunta: 1, id_opcion: 1 }] })).status).toBe(404);
  });
  test('actividad sin preguntas → 422', async () => {
    const act = (await ctx.D.post('/api/actividades', { titulo: 'vacía', descripcion: 'd', id_tipo_actividad: 1, id_modulo: ctx.mod.id_modulo, id_docente: ctx.doc.id_usuario, instrucciones: 'i', criterio_evaluacion: 'c', puntaje_maximo: 10 })).body;
    const u = (await ctx.anon.post('/api/usuarios', usuarioBase('resp4'))).body;
    const E = as(await login('resp4'));
    const pr = (await E.post('/api/progresos', { id_actividad: act.id_actividad })).body;
    expect(pr.id_estudiante).toBe(u.id_usuario);
    expect((await E.post(`/api/progresos/${pr.id_progreso}/responder`, { respuestas: [{ id_pregunta: 1, id_opcion: 1 }] })).status).toBe(422);
  });
});

describe('CU-005 / RNF-013 — reportes con archivo real', () => {
  const base = () => ({ rango: '2026-01 a 2026-06' });
  test.each([['PDF', '%PDF'], ['Excel', 'PK']])('genera %s y responde en < 5 s', async (formato, magic) => {
    const t = Date.now();
    const r = await ctx.D.post('/api/reportes/generar', { ...base(), tipo: 'grupal', formato });
    expect(Date.now() - t).toBeLessThan(5000);
    expect(r.status).toBe(201);
    expect(r.body.id_generado_por).toBe(ctx.doc.id_usuario); // autor = quien tiene el token
    const archivo = path.join(process.env.REPORTES_DIR, path.basename(r.body.contenido_url));
    expect(fs.readFileSync(archivo).slice(0, magic.length).toString()).toBe(magic);
  });
  test('el estudiante no genera reportes (403) y sin token 401', async () => {
    expect((await ctx.E.post('/api/reportes/generar', { ...base(), tipo: 'global', formato: 'PDF' })).status).toBe(403);
    expect((await ctx.anon.post('/api/reportes/generar', { ...base(), tipo: 'global', formato: 'PDF' })).status).toBe(401);
  });
  test('individual requiere id_estudiante; tipo/formato inválidos → 422', async () => {
    expect((await ctx.D.post('/api/reportes/generar', { ...base(), tipo: 'individual', formato: 'PDF' })).status).toBe(422);
    expect((await ctx.D.post('/api/reportes/generar', { ...base(), tipo: 'x', formato: 'PDF' })).status).toBe(422);
    expect((await ctx.D.post('/api/reportes/generar', { ...base(), tipo: 'global', formato: 'Word' })).status).toBe(422);
    const ok = await ctx.A.post('/api/reportes/generar', { ...base(), tipo: 'individual', formato: 'Excel', id_estudiante: ctx.est.id_usuario });
    expect(ok.status).toBe(201);
  });
});

describe('CRUD de recurso (crudController)', () => {
  test('PUT actualiza; DELETE físico → 204 y luego 404', async () => {
    const put = await ctx.D.put(`/api/actividades/${ctx.act.id_actividad}`, { titulo: 'Quiz v2' });
    expect(put.status).toBe(200);
    expect(put.body.titulo).toBe('Quiz v2');
    expect((await ctx.D.put('/api/actividades/9999999', { titulo: 'x' })).status).toBe(404);
    const n = (await ctx.E.post('/api/notificaciones', { id_usuario: ctx.est.id_usuario, tipo: 't', mensaje: 'm' })).body;
    expect((await ctx.E.del(`/api/notificaciones/${n.id_notificacion}`)).status).toBe(204);
    expect((await ctx.E.del(`/api/notificaciones/${n.id_notificacion}`)).status).toBe(404);
  });
});
