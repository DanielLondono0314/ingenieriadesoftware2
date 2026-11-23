const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-007, RF-008 | E12-NivelEducativo · M1 — niveles K-12 que segmentan los módulos
module.exports = crearCrudController(m.NivelEducativo, {
  rf: { listar: 'RF-008', consultar: 'RF-008', crear: 'RF-007', modificar: 'RF-007', eliminar: 'RF-007' },
});
