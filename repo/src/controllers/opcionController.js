const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-016 | E8-OPCION_RESPUESTA — opciones (es_correcta alimenta la evaluación automática)
module.exports = crearCrudController(m.OpcionRespuesta, {
  include: [{ model: m.Pregunta }],
  rf: { crear: 'RF-012', listar: 'RF-016', consultar: 'RF-016', modificar: 'RF-014', eliminar: 'RF-015' },
});
