const m = require('../models');
const { crearCrudController } = require('./crudController');

// CU-001/CU-003 | RF-012 a RF-015 | E12-Actividad · E13-Actividad · E14-DE01 · M9
const crud = crearCrudController(m.Actividad, {
  include: [{ model: m.TipoActividad }, { model: m.Modulo }, { model: m.Usuario, as: 'docente' }],
  rf: { crear: 'RF-012', listar: 'RF-013', consultar: 'RF-013', modificar: 'RF-014', eliminar: 'RF-015' },
});

// CU-001 paso 5 | RF-016 | E8-PREGUNTA/OPCION_RESPUESTA — GET /api/actividades/:id/preguntas
// Preguntas de la actividad con sus opciones, ordenadas (alimenta el reproductor del estudiante).
async function preguntasDeActividad(req, res, next) {
  try {
    res.json(await m.Pregunta.findAll({
      where: { id_actividad: req.params.id },
      include: [{ model: m.OpcionRespuesta, as: 'opciones' }],
      order: [['orden', 'ASC'], [{ model: m.OpcionRespuesta, as: 'opciones' }, 'orden', 'ASC']],
    }));
  } catch (err) { next(err); }
}

module.exports = { ...crud, preguntasDeActividad };
