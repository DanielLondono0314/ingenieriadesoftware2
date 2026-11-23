const { Router } = require('express');
const { Op } = require('sequelize');
const { buildCrudRouter } = require('../utils/crudFactory');
const m = require('../models');
const { completarProgreso } = require('../services/progresoService');
const { desactivarUsuario } = require('../services/usuarioService');
const { login } = require('../services/authService');
const { responderActividad } = require('../services/evaluacionService');
const { generarReporte } = require('../services/reporteService');
const { ROLES, autenticar, requerirRol } = require('../middleware/auth');
const { ForbiddenError } = require('../errors/AppError');

const { ESTUDIANTE: EST, DOCENTE: DOC, ADMIN: ADM } = ROLES;
const STAFF = [DOC, ADM];
const ADMIN_ESCRIBE = { crear: [ADM], modificar: [ADM], eliminar: [ADM] };
const STAFF_ESCRIBE = { crear: STAFF, modificar: STAFF, eliminar: STAFF };

// RF-006 — el estudiante solo opera sobre su propio progreso; docente/admin sobre cualquiera.
async function soloSuProgreso(req, res, next) {
  try {
    if (req.user.rol === EST) {
      const p = await m.ProgresoEstudiante.findByPk(req.params.id);
      if (p && p.id_estudiante !== req.user.id) throw new ForbiddenError();
    }
    next();
  } catch (err) { next(err); }
}

const router = Router();

// ── Reglas de negocio (Semana 5-6) ──────────────────────────
// Se montan ANTES de los routers CRUD genéricos para tener prioridad de match.

// CU-002 | RF-005 | RNF-004,RNF-005 | E13-Login — autenticación con bloqueo por intentos
router.post('/auth/login', async (req, res, next) => {
  try {
    const { token, usuario } = await login(req.body.correo, req.body.contrasena);
    res.json({ token, usuario });
  } catch (err) { next(err); }
});

// CU-001 pasos 5-6 | RF-016,RF-018 | evaluación automática en el servidor (es_correcta)
router.post('/progresos/:id/responder', autenticar, soloSuProgreso, async (req, res, next) => {
  try {
    res.json(await responderActividad(req.params.id, req.body.respuestas));
  } catch (err) { next(err); }
});

// CU-005 | RF-022,RF-023 | RNF-013 — genera el archivo PDF/Excel y registra el REPORTE
router.post('/reportes/generar', autenticar, requerirRol(...STAFF), async (req, res, next) => {
  try {
    res.status(201).json(await generarReporte(req.body));
  } catch (err) { next(err); }
});

// CU-001 | RF-016,RF-018 | E12-ProgresoEstudiante.completar() · E14-DE02
router.post('/progresos/:id/completar', autenticar, soloSuProgreso, async (req, res, next) => {
  try {
    const progreso = await completarProgreso(req.params.id, Number(req.body.puntaje));
    res.json(progreso);
  } catch (err) { next(err); }
});

// CU-002 | RF-004 | E12-Usuario.desactivar() · E14-DE03 (soft-delete: estado='inactivo')
router.delete('/usuarios/:id', autenticar, requerirRol(ADM), async (req, res, next) => {
  try {
    const usuario = await desactivarUsuario(req.params.id);
    res.json(usuario);
  } catch (err) { next(err); }
});

// CU-001 paso 5 | RF-016 | E8-PREGUNTA/OPCION_RESPUESTA — preguntas de una
// actividad con sus opciones, ordenadas. Alimenta el reproductor del estudiante.
router.get('/actividades/:id/preguntas', autenticar, async (req, res, next) => {
  try {
    const preguntas = await m.Pregunta.findAll({
      where: { id_actividad: req.params.id },
      include: [{ model: m.OpcionRespuesta, as: 'opciones' }],
      order: [['orden', 'ASC'], [{ model: m.OpcionRespuesta, as: 'opciones' }, 'orden', 'ASC']],
    });
    res.json(preguntas);
  } catch (err) { next(err); }
});

// ── Tablas maestras (Semana 3) ──────────────────────────────
// CU-002 | RF-006 | E12-Rol · M9 — CRUD de roles y permisos
router.use('/roles', buildCrudRouter(m.Rol, { acceso: { crear: [ADM], modificar: [ADM], eliminar: [ADM] } }));
// CU-002/CU-003 | RF-007,RF-008 | E12-NivelEducativo · M1 — niveles K-12
router.use('/niveles-educativos', buildCrudRouter(m.NivelEducativo, { acceso: ADMIN_ESCRIBE }));
// CU-003 | RF-007 | E12-TipoContenido — catálogo de tipos de contenido
router.use('/tipos-contenido', buildCrudRouter(m.TipoContenido, { acceso: ADMIN_ESCRIBE }));
// CU-003 | RF-012 | E12-TipoActividad — catálogo de tipos de actividad
router.use('/tipos-actividad', buildCrudRouter(m.TipoActividad, { acceso: ADMIN_ESCRIBE }));
// CU-002 | RF-001,RF-002 | E12-Institucion · M1(EC-09) — instituciones
router.use('/instituciones', buildCrudRouter(m.Institucion, { acceso: ADMIN_ESCRIBE }));

// ── Tablas transaccionales (Semana 4) ───────────────────────
// CU-002/CU-001 | RF-001,RF-003,RF-004,RF-005 | E12-Usuario · E13-Login · M9
// E14-DE03 — el listado solo muestra usuarios vigentes (oculta inactivo/eliminado_logico)
router.use(
  '/usuarios',
  buildCrudRouter(m.Usuario, {
    include: [{ model: m.Rol }, { model: m.NivelEducativo }],
    listWhere: { estado: { [Op.notIn]: ['inactivo', 'eliminado_logico'] } },
    acceso: { listar: STAFF, consultar: 'auth', crear: 'publico', modificar: 'auth', eliminar: [ADM] },
    propio: { campo: 'id_usuario', roles: [EST], escritura: [DOC] },
    // Auto-registro sin sesión (o sin ser admin): siempre estudiante activo.
    sanearCrear: (req, b) => (req.user && req.user.rol === ADM ? b : { ...b, id_rol: EST, estado: 'activo' }),
    sanearModificar: (req, b) => {
      if (req.user.rol === ADM) return b;
      const { id_rol, estado, ...resto } = b; // no se auto-eleva el rol ni el estado
      return resto;
    },
  })
);

// CU-002 | RF-001 | E12-Matricula · M1(EC-09) — vínculo Usuario↔Institucion
router.use(
  '/matriculas',
  buildCrudRouter(m.Matricula, {
    include: [{ model: m.Usuario }, { model: m.Institucion }],
    acceso: { listar: STAFF, consultar: STAFF, crear: [ADM], modificar: [ADM], eliminar: [ADM] },
  })
);

// CU-003 | RF-007 a RF-011 | E12-Modulo · E13-Actividad · M9 — módulos educativos
router.use(
  '/modulos',
  buildCrudRouter(m.Modulo, {
    include: [
      { model: m.TipoContenido },
      { model: m.NivelEducativo },
      { model: m.Usuario, as: 'docente' },
    ],
    acceso: STAFF_ESCRIBE,
  })
);

// CU-001/CU-003 | RF-012 a RF-016 | E12-Actividad · E13-Actividad · E14-DE01 · M9
router.use(
  '/actividades',
  buildCrudRouter(m.Actividad, {
    include: [
      { model: m.TipoActividad },
      { model: m.Modulo },
      { model: m.Usuario, as: 'docente' },
    ],
    acceso: STAFF_ESCRIBE,
  })
);

// CU-001 | RF-017,RF-018,RF-020 | E12-ProgresoEstudiante · E14-DE02 · M9
router.use(
  '/progresos',
  buildCrudRouter(m.ProgresoEstudiante, {
    include: [
      { model: m.Usuario, as: 'estudiante' },
      { model: m.Actividad },
    ],
    acceso: { crear: 'auth', modificar: STAFF, eliminar: STAFF },
    propio: { campo: 'id_estudiante', roles: [EST] },
  })
);

// CU-001/CU-004 | RF-018,RF-019,RF-021 | E12-HistorialPractica · M9
router.use(
  '/historiales',
  buildCrudRouter(m.HistorialPractica, {
    include: [
      { model: m.Usuario, as: 'estudiante' },
      { model: m.Modulo },
    ],
    acceso: { crear: 'auth', modificar: STAFF, eliminar: STAFF }, // el estudiante registra su propio módulo completado (RF-018)
    propio: { campo: 'id_estudiante', roles: [EST] },
  })
);

// CU-005 | RF-022,RF-023 | E12-Reporte · E13-Reporte · M1(EC-06) · M9
router.use(
  '/reportes',
  buildCrudRouter(m.Reporte, {
    include: [
      { model: m.Usuario, as: 'autor' },
      { model: m.Institucion },
    ],
    acceso: { listar: STAFF, consultar: STAFF, ...STAFF_ESCRIBE },
  })
);

// CU-001 | RF-016 | E8-PREGUNTA — preguntas evaluables de cada actividad
router.use(
  '/preguntas',
  buildCrudRouter(m.Pregunta, { include: [{ model: m.OpcionRespuesta, as: 'opciones' }], acceso: STAFF_ESCRIBE })
);

// RF-012 | E8-OPCION_RESPUESTA — opciones (las correctas evalúan automáticamente)
router.use(
  '/opciones',
  buildCrudRouter(m.OpcionRespuesta, { include: [{ model: m.Pregunta }], acceso: STAFF_ESCRIBE })
);

// SCR-13 · DE-01 | E8-NOTIFICACION — avisos por usuario
router.use('/notificaciones', buildCrudRouter(m.Notificacion, {
    acceso: { crear: 'auth' },
    propio: { campo: 'id_usuario', roles: [EST, DOC], libreCrear: [DOC] },
    // docente puede notificar a estudiantes; el estudiante solo se notifica a sí mismo
  }));

module.exports = router;
