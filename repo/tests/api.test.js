// Pruebas de integración del backend (Jest + Supertest) contra PostgreSQL creada con el DDL (E11).
// Requiere la BD `ia_k12` con los seeds del DDL. Cada ejecución usa correos únicos.
process.env.SECURITY_LOG = require('path').join(require('os').tmpdir(), 'seguridad-test.log');
process.env.REPORTES_DIR = require('path').join(require('os').tmpdir(), 'reportes-test');
process.env.LOGIN_MAX_INTENTOS = '5';

const fs = require('fs');
const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/models');
const { reiniciar } = require('../src/services/authService');

const sufijo = Date.now();
const correo = (n) => `${n}-${sufijo}@test.edu.co`;
const usuarioBase = (n) => ({ nombre: n, apellido: 'Test', correo: correo(n), contrasena: 'Clave1234', id_rol: 1, id_nivel: 1 });
const ctx = {};

beforeAll(async () => {
  const est = await request(app).post('/api/usuarios').send(usuarioBase('est'));
  const doc = await request(app).post('/api/usuarios').send({ ...usuarioBase('doc'), id_rol: 2 });
  ctx.est = est.body; ctx.doc = doc.body;
  const mod = await request(app).post('/api/modulos').send({
    titulo: 'Mod test', descripcion: 'd', id_tipo_contenido: 1, id_nivel: 1, id_docente: ctx.doc.id_usuario,
  });
  ctx.mod = mod.body;
  const act = await request(app).post('/api/actividades').send({
    titulo: 'Quiz test', descripcion: 'd', id_tipo_actividad: 1, id_modulo: ctx.mod.id_modulo, id_docente: ctx.doc.id_usuario,
    instrucciones: 'i', criterio_evaluacion: 'c', puntaje_maximo: 100,
  });
  ctx.act = act.body;
  ctx.preguntas = [];
  for (const n of [1, 2]) {
    const p = (await request(app).post('/api/preguntas').send({ id_actividad: ctx.act.id_actividad, enunciado: `P${n}`, orden: n, retroalimentacion: `fb${n}` })).body;
    const ok = (await request(app).post('/api/opciones').send({ id_pregunta: p.id_pregunta, texto: 'ok', es_correcta: true, orden: 1 })).body;
    const mal = (await request(app).post('/api/opciones').send({ id_pregunta: p.id_pregunta, texto: 'mal', es_correcta: false, orden: 2 })).body;
    ctx.preguntas.push({ p, ok, mal });
  }
});

afterAll(async () => { await sequelize.close(); });
beforeEach(() => reiniciar());

describe('Salud y maestras', () => {
  test('GET /api/health', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.db).toBe('connected');
  });
  test.each(['roles', 'niveles-educativos', 'tipos-contenido', 'tipos-actividad'])('GET /api/%s trae seeds', async (ep) => {
    const r = await request(app).get(`/api/${ep}`);
    expect(r.status).toBe(200);
    expect(r.body.length).toBeGreaterThan(0);
  });
  test('GET /api inexistente → 404 y /api/api-x', async () => {
    expect((await request(app).get('/api/no-existe')).status).toBe(404);
    expect((await request(app).get('/api/usuarios/9999999')).status).toBe(404);
  });
  test('GET /api devuelve metadatos', async () => {
    expect((await request(app).get('/api')).body.nombre).toBe('IA-K12 Backend');
  });
});

describe('RNF-004 / RNF-015 usuarios', () => {
  test('la respuesta no expone la contraseña y se guarda con bcrypt', async () => {
    expect(ctx.est.contrasena).toBeUndefined();
    const [rows] = await sequelize.query('SELECT contrasena FROM usuario WHERE id_usuario = :id', { replacements: { id: ctx.est.id_usuario } });
    expect(rows[0].contrasena).toMatch(/^\$2[aby]\$12\$/);
  });
  test('correo duplicado → 409 (BUG-01)', async () => {
    const r = await request(app).post('/api/usuarios').send(usuarioBase('est'));
    expect(r.status).toBe(409);
  });
  test('campos obligatorios y CHECK → 400', async () => {
    expect((await request(app).post('/api/usuarios').send({ nombre: 'x' })).status).toBe(400);
    expect((await request(app).post('/api/instituciones').send({ nombre: 'a', municipio: 'b', tipo: 'Oficial' })).status).toBe(400);
    expect((await request(app).post('/api/instituciones').send({ nombre: 'a', municipio: 'b', tipo: 'publica' })).status).toBe(201);
  });
  test('FK inexistente → 409', async () => {
    const r = await request(app).post('/api/modulos').send({ titulo: 't', descripcion: 'd', id_tipo_contenido: 9999, id_nivel: 1, id_docente: ctx.doc.id_usuario });
    expect(r.status).toBe(409);
  });
});

describe('RF-005 / RNF-005 login y bloqueo', () => {
  test('login correcto devuelve token y usuario sin contraseña', async () => {
    const r = await request(app).post('/api/auth/login').send({ correo: correo('est'), contrasena: 'Clave1234' });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeTruthy();
    expect(r.body.usuario.contrasena).toBeUndefined();
  });
  test('faltan datos → 400; correo inexistente → 401', async () => {
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(400);
    expect((await request(app).post('/api/auth/login').send({ correo: 'no@no.co', contrasena: 'x' })).status).toBe(401);
  });
  test('5 intentos fallidos bloquean la cuenta (423) incluso con la clave correcta', async () => {
    const u = (await request(app).post('/api/usuarios').send(usuarioBase('bloq'))).body;
    for (let i = 1; i <= 4; i += 1) {
      expect((await request(app).post('/api/auth/login').send({ correo: correo('bloq'), contrasena: 'mala' })).status).toBe(401);
    }
    expect((await request(app).post('/api/auth/login').send({ correo: correo('bloq'), contrasena: 'mala' })).status).toBe(423);
    expect((await request(app).post('/api/auth/login').send({ correo: correo('bloq'), contrasena: 'Clave1234' })).status).toBe(423);
    expect((await request(app).get(`/api/usuarios/${u.id_usuario}`)).body.estado).toBe('bloqueado_temporal');
    expect(fs.readFileSync(process.env.SECURITY_LOG, 'utf8')).toContain(`BLOQUEO ${correo('bloq')}`);
  });
  test('el bloqueo vencido se levanta', async () => {
    const u = (await request(app).post('/api/usuarios').send(usuarioBase('venc'))).body;
    await sequelize.query("UPDATE usuario SET estado = 'bloqueado_temporal' WHERE id_usuario = :id", { replacements: { id: u.id_usuario } });
    const r = await request(app).post('/api/auth/login').send({ correo: correo('venc'), contrasena: 'Clave1234' });
    expect(r.status).toBe(200);
  });
  test('cuenta inactiva → 403', async () => {
    const u = (await request(app).post('/api/usuarios').send(usuarioBase('inact'))).body;
    await request(app).delete(`/api/usuarios/${u.id_usuario}`);
    expect((await request(app).post('/api/auth/login').send({ correo: correo('inact'), contrasena: 'Clave1234' })).status).toBe(403);
  });
});

describe('Regla 1 — completar progreso (E14-DE02)', () => {
  let id;
  beforeAll(async () => {
    const e = (await request(app).post('/api/usuarios').send(usuarioBase('reg1'))).body;
    id = (await request(app).post('/api/progresos').send({ id_estudiante: e.id_usuario, id_actividad: ctx.act.id_actividad })).body.id_progreso;
  });
  test('puntaje fuera de rango → 422, válido → 200, repetir → 409, inexistente → 404', async () => {
    expect((await request(app).post(`/api/progresos/${id}/completar`).send({ puntaje: 999 })).status).toBe(422);
    expect((await request(app).post(`/api/progresos/${id}/completar`).send({ puntaje: 85 })).status).toBe(200);
    expect((await request(app).post(`/api/progresos/${id}/completar`).send({ puntaje: 50 })).status).toBe(409);
    expect((await request(app).post('/api/progresos/9999999/completar').send({ puntaje: 1 })).status).toBe(404);
  });
  test('al completar se crea la notificación automática (GAP-02)', async () => {
    const e = (await request(app).get(`/api/progresos/${id}`)).body.id_estudiante;
    const n = (await request(app).get('/api/notificaciones')).body.filter((x) => x.id_usuario === e && x.tipo === 'actividad_calificada');
    expect(n.length).toBe(1);
    expect(n[0].leida).toBe(false);
  });
});

describe('Regla 2 — desactivar usuario (E14-DE03)', () => {
  test('soft-delete: 200, oculto del listado, accesible por id, 409 al repetir, 404 inexistente', async () => {
    const u = (await request(app).post('/api/usuarios').send(usuarioBase('soft'))).body;
    const r = await request(app).delete(`/api/usuarios/${u.id_usuario}`);
    expect(r.status).toBe(200);
    expect(r.body.estado).toBe('inactivo');
    expect((await request(app).get('/api/usuarios')).body.some((x) => x.id_usuario === u.id_usuario)).toBe(false);
    expect((await request(app).get(`/api/usuarios/${u.id_usuario}`)).status).toBe(200);
    expect((await request(app).delete(`/api/usuarios/${u.id_usuario}`)).status).toBe(409);
    expect((await request(app).delete('/api/usuarios/9999999')).status).toBe(404);
  });
});

describe('CU-001 / GAP-01 — responder actividad (evaluación automática)', () => {
  const nuevoProgreso = async (n) => {
    const e = (await request(app).post('/api/usuarios').send(usuarioBase(n))).body;
    return (await request(app).post('/api/progresos').send({ id_estudiante: e.id_usuario, id_actividad: ctx.act.id_actividad })).body.id_progreso;
  };
  test('GET /actividades/:id/preguntas devuelve opciones ordenadas', async () => {
    const r = await request(app).get(`/api/actividades/${ctx.act.id_actividad}/preguntas`);
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(2);
    expect(r.body[0].opciones).toHaveLength(2);
  });
  test('1 de 2 correctas → puntaje 50 sobre 100 con retroalimentación por pregunta', async () => {
    const id = await nuevoProgreso('resp1');
    const [a, b] = ctx.preguntas;
    const r = await request(app).post(`/api/progresos/${id}/responder`).send({
      respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: a.ok.id_opcion }, { id_pregunta: b.p.id_pregunta, id_opcion: b.mal.id_opcion }],
    });
    expect(r.status).toBe(200);
    expect(r.body.puntaje).toBe(50);
    expect(r.body.aciertos).toBe(1);
    expect(r.body.progreso.estado).toBe('completado');
    expect(r.body.detalle[0].retroalimentacion).toBe('fb1');
  });
  test('todas correctas → 100', async () => {
    const id = await nuevoProgreso('resp2');
    const r = await request(app).post(`/api/progresos/${id}/responder`).send({
      respuestas: ctx.preguntas.map((x) => ({ id_pregunta: x.p.id_pregunta, id_opcion: x.ok.id_opcion })),
    });
    expect(r.body.puntaje).toBe(100);
  });
  test('validaciones: vacío 422, opción ajena 422, repetir 409, progreso inexistente 404', async () => {
    const id = await nuevoProgreso('resp3');
    const [a, b] = ctx.preguntas;
    expect((await request(app).post(`/api/progresos/${id}/responder`).send({ respuestas: [] })).status).toBe(422);
    expect((await request(app).post(`/api/progresos/${id}/responder`).send({ respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: b.ok.id_opcion }] })).status).toBe(422);
    expect((await request(app).post(`/api/progresos/${id}/responder`).send({ respuestas: [{ id_pregunta: 9999999, id_opcion: 1 }] })).status).toBe(422);
    await request(app).post(`/api/progresos/${id}/responder`).send({ respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: a.ok.id_opcion }] });
    expect((await request(app).post(`/api/progresos/${id}/responder`).send({ respuestas: [{ id_pregunta: a.p.id_pregunta, id_opcion: a.ok.id_opcion }] })).status).toBe(409);
    expect((await request(app).post('/api/progresos/9999999/responder').send({ respuestas: [{ id_pregunta: 1, id_opcion: 1 }] })).status).toBe(404);
  });
  test('actividad sin preguntas → 422', async () => {
    const act = (await request(app).post('/api/actividades').send({ titulo: 'vacía', descripcion: 'd', id_tipo_actividad: 1, id_modulo: ctx.mod.id_modulo, id_docente: ctx.doc.id_usuario, instrucciones: 'i', criterio_evaluacion: 'c', puntaje_maximo: 10 })).body;
    const e = (await request(app).post('/api/usuarios').send(usuarioBase('resp4'))).body;
    const pr = (await request(app).post('/api/progresos').send({ id_estudiante: e.id_usuario, id_actividad: act.id_actividad })).body;
    expect((await request(app).post(`/api/progresos/${pr.id_progreso}/responder`).send({ respuestas: [{ id_pregunta: 1, id_opcion: 1 }] })).status).toBe(422);
  });
});

describe('CU-005 / RNF-013 — reportes con archivo real', () => {
  const base = () => ({ rango: '2026-01 a 2026-06', id_generado_por: ctx.doc.id_usuario });
  test.each([['PDF', '%PDF'], ['Excel', 'PK']])('genera %s y responde en < 5 s', async (formato, magic) => {
    const t = Date.now();
    const r = await request(app).post('/api/reportes/generar').send({ ...base(), tipo: 'grupal', formato });
    expect(Date.now() - t).toBeLessThan(5000);
    expect(r.status).toBe(201);
    const archivo = require('path').join(process.env.REPORTES_DIR, require('path').basename(r.body.contenido_url));
    expect(fs.readFileSync(archivo).slice(0, magic.length).toString()).toBe(magic);
  });
  test('individual requiere id_estudiante; tipo/formato inválidos → 422', async () => {
    expect((await request(app).post('/api/reportes/generar').send({ ...base(), tipo: 'individual', formato: 'PDF' })).status).toBe(422);
    expect((await request(app).post('/api/reportes/generar').send({ ...base(), tipo: 'x', formato: 'PDF' })).status).toBe(422);
    expect((await request(app).post('/api/reportes/generar').send({ ...base(), tipo: 'global', formato: 'Word' })).status).toBe(422);
    expect((await request(app).post('/api/reportes/generar').send({ tipo: 'global', formato: 'PDF' })).status).toBe(422);
    const ok = await request(app).post('/api/reportes/generar').send({ ...base(), tipo: 'individual', formato: 'Excel', id_estudiante: ctx.est.id_usuario });
    expect(ok.status).toBe(201);
  });
});

describe('CRUD genérico', () => {
  test('PUT actualiza, DELETE físico → 204 y luego 404', async () => {
    const put = await request(app).put(`/api/actividades/${ctx.act.id_actividad}`).send({ titulo: 'Quiz v2' });
    expect(put.status).toBe(200);
    expect(put.body.titulo).toBe('Quiz v2');
    expect((await request(app).put('/api/actividades/9999999').send({ titulo: 'x' })).status).toBe(404);
    const n = (await request(app).post('/api/notificaciones').send({ id_usuario: ctx.est.id_usuario, tipo: 't', mensaje: 'm' })).body;
    expect((await request(app).delete(`/api/notificaciones/${n.id_notificacion}`)).status).toBe(204);
    expect((await request(app).delete(`/api/notificaciones/${n.id_notificacion}`)).status).toBe(404);
  });
});
