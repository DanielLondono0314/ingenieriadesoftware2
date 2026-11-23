const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-016 | E8-PREGUNTA — preguntas evaluables de cada actividad
module.exports = crearCrudController(m.Pregunta, {
  include: [{ model: m.OpcionRespuesta, as: 'opciones' }],
  rf: { crear: 'RF-012', listar: 'RF-016', consultar: 'RF-016', modificar: 'RF-014', eliminar: 'RF-015' },
});
