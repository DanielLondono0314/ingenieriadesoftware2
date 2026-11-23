const m = require('../models');
const { ROLES } = require('../middleware/auth');
const { ForbiddenError, NotFoundError } = require('../errors/AppError');
const { completarProgreso } = require('../services/progresoService');
const { responderActividad } = require('../services/evaluacionService');
const { crearCrudController } = require('./crudController');

// CU-001 | RF-017, RF-018, RF-020 | E12-ProgresoEstudiante · E14-DE02 · M9
const crud = crearCrudController(m.ProgresoEstudiante, {
  include: [{ model: m.Usuario, as: 'estudiante' }, { model: m.Actividad }],
  propio: { campo: 'id_estudiante', roles: [ROLES.ESTUDIANTE] },
  rf: { crear: 'RF-017', listar: 'RF-020', consultar: 'RF-020', modificar: 'RF-017', eliminar: 'RF-017' },
});

// RF-006 — el estudiante solo opera sobre su propio progreso; docente/administrador sobre cualquiera.
async function verificarPropietario(req) {
  const progreso = await m.ProgresoEstudiante.findByPk(req.params.id);
  if (!progreso) throw new NotFoundError(`No existe el progreso ${req.params.id}`);
  if (req.user.rol === ROLES.ESTUDIANTE && progreso.id_estudiante !== req.user.id) throw new ForbiddenError();
}

// CU-001 pasos 5-6 | RF-016, RF-018 — POST /api/progresos/:id/responder (evaluación en el servidor)
async function responder(req, res, next) {
  try {
    await verificarPropietario(req);
    res.json(await responderActividad(req.params.id, req.body.respuestas));
  } catch (err) { next(err); }
}

// CU-001 | RF-016, RF-018 | E12-ProgresoEstudiante.completar() · E14-DE02 — POST /api/progresos/:id/completar
async function completar(req, res, next) {
  try {
    await verificarPropietario(req);
    res.json(await completarProgreso(req.params.id, Number(req.body.puntaje)));
  } catch (err) { next(err); }
}

module.exports = { ...crud, responder, completar };
