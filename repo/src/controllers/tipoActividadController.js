const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-012 | E12-TipoActividad — catálogo de tipos de actividad
module.exports = crearCrudController(m.TipoActividad, {
  rf: { listar: 'RF-013', consultar: 'RF-013', crear: 'RF-012', modificar: 'RF-012', eliminar: 'RF-012' },
});
