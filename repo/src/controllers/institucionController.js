const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-001, RF-002 | E12-Institucion · M1(EC-09) — instituciones
module.exports = crearCrudController(m.Institucion, {
  rf: { listar: 'RF-002', consultar: 'RF-002', crear: 'RF-001', modificar: 'RF-003', eliminar: 'RF-004' },
});
