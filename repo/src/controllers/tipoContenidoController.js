const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-007 | E12-TipoContenido — catálogo de tipos de contenido de un módulo
module.exports = crearCrudController(m.TipoContenido, {
  rf: { listar: 'RF-008', consultar: 'RF-008', crear: 'RF-007', modificar: 'RF-007', eliminar: 'RF-007' },
});
