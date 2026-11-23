const { Router } = require('express');
const { Op } = require('sequelize');
const { buildCrudRouter } = require('../utils/crudFactory');
const m = require('../models');
const { completarProgreso } = require('../services/progresoService');
const { desactivarUsuario } = require('../services/usuarioService');
const { responderActividad } = require('../services/evaluacionService');
const { generarReporte } = require('../services/reporteService');

const router = Router();

// ── Reglas de negocio (Semana 5-6) ──────────────────────────
// Se montan ANTES de los routers CRUD genéricos para tener prioridad de match.

// CU-001 pasos 5-6 | RF-016,RF-018 | evaluación automática en el servidor (es_correcta)
router.post('/progresos/:id/responder', async (req, res, next) => {
  try {
    res.json(await responderActividad(req.params.id, req.body.respuestas));
  } catch (err) { next(err); }
});

// CU-005 | RF-022,RF-023 | RNF-013 — genera el archivo PDF/Excel y registra el REPORTE
router.post('/reportes/generar', async (req, res, next) => {
  try {
    res.status(201).json(await generarReporte(req.body));
  } catch (err) { next(err); }
});

// CU-001 | RF-016,RF-018 | E12-ProgresoEstudiante.completar() · E14-DE02
router.post('/progresos/:id/completar', async (req, res, next) => {
  try {
    const progreso = await completarProgreso(req.params.id, Number(req.body.puntaje));
    res.json(progreso);
  } catch (err) { next(err); }
});

// CU-002 | RF-004 | E12-Usuario.desactivar() · E14-DE03 (soft-delete: estado='inactivo')
router.delete('/usuarios/:id', async (req, res, next) => {
  try {
    const usuario = await desactivarUsuario(req.params.id);
    res.json(usuario);
  } catch (err) { next(err); }
});

// CU-001 paso 5 | RF-016 | E8-PREGUNTA/OPCION_RESPUESTA — preguntas de una
// actividad con sus opciones, ordenadas. Alimenta el reproductor del estudiante.
router.get('/actividades/:id/preguntas', async (req, res, next) => {
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
router.use('/roles', buildCrudRouter(m.Rol));
// CU-002/CU-003 | RF-007,RF-008 | E12-NivelEducativo · M1 — niveles K-12
router.use('/niveles-educativos', buildCrudRouter(m.NivelEducativo));
// CU-003 | RF-007 | E12-TipoContenido — catálogo de tipos de contenido
router.use('/tipos-contenido', buildCrudRouter(m.TipoContenido));
// CU-003 | RF-012 | E12-TipoActividad — catálogo de tipos de actividad
router.use('/tipos-actividad', buildCrudRouter(m.TipoActividad));
// CU-002 | RF-001,RF-002 | E12-Institucion · M1(EC-09) — instituciones
router.use('/instituciones', buildCrudRouter(m.Institucion));

// ── Tablas transaccionales (Semana 4) ───────────────────────
// CU-002/CU-001 | RF-001,RF-003,RF-004,RF-005 | E12-Usuario · E13-Login · M9
// E14-DE03 — el listado solo muestra usuarios vigentes (oculta inactivo/eliminado_logico)
router.use(
  '/usuarios',
  buildCrudRouter(m.Usuario, {
    include: [{ model: m.Rol }, { model: m.NivelEducativo }],
    listWhere: { estado: { [Op.notIn]: ['inactivo', 'eliminado_logico'] } },
  })
);

// CU-002 | RF-001 | E12-Matricula · M1(EC-09) — vínculo Usuario↔Institucion
router.use(
  '/matriculas',
  buildCrudRouter(m.Matricula, {
    include: [{ model: m.Usuario }, { model: m.Institucion }],
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
  })
);

// CU-001 | RF-016 | E8-PREGUNTA — preguntas evaluables de cada actividad
router.use(
  '/preguntas',
  buildCrudRouter(m.Pregunta, { include: [{ model: m.OpcionRespuesta, as: 'opciones' }] })
);

// RF-012 | E8-OPCION_RESPUESTA — opciones (las correctas evalúan automáticamente)
router.use(
  '/opciones',
  buildCrudRouter(m.OpcionRespuesta, { include: [{ model: m.Pregunta }] })
);

// SCR-13 · DE-01 | E8-NOTIFICACION — avisos por usuario
router.use('/notificaciones', buildCrudRouter(m.Notificacion));

module.exports = router;
