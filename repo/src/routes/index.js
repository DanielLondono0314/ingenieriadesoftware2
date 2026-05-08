const { Router } = require('express');
const { buildCrudRouter } = require('../utils/crudFactory');
const m = require('../models');

const router = Router();

// ── Tablas maestras (Semana 3) ──────────────────────────────
router.use('/roles', buildCrudRouter(m.Rol));
router.use('/niveles-educativos', buildCrudRouter(m.NivelEducativo));
router.use('/tipos-contenido', buildCrudRouter(m.TipoContenido));
router.use('/tipos-actividad', buildCrudRouter(m.TipoActividad));
router.use('/instituciones', buildCrudRouter(m.Institucion));

// ── Tablas transaccionales (Semana 4) ───────────────────────
router.use(
  '/usuarios',
  buildCrudRouter(m.Usuario, {
    include: [{ model: m.Rol }, { model: m.NivelEducativo }],
  })
);

router.use(
  '/matriculas',
  buildCrudRouter(m.Matricula, {
    include: [{ model: m.Usuario }, { model: m.Institucion }],
  })
);

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

router.use(
  '/progresos',
  buildCrudRouter(m.ProgresoEstudiante, {
    include: [
      { model: m.Usuario, as: 'estudiante' },
      { model: m.Actividad },
    ],
  })
);

router.use(
  '/historiales',
  buildCrudRouter(m.HistorialPractica, {
    include: [
      { model: m.Usuario, as: 'estudiante' },
      { model: m.Modulo },
    ],
  })
);

router.use(
  '/reportes',
  buildCrudRouter(m.Reporte, {
    include: [
      { model: m.Usuario, as: 'autor' },
      { model: m.Institucion },
    ],
  })
);

module.exports = router;
