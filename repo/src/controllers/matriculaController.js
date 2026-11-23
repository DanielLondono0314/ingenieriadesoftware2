const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-001 | E12-Matricula · M1(EC-09) — vínculo Usuario ↔ Institución
module.exports = crearCrudController(m.Matricula, {
  include: [{ model: m.Usuario }, { model: m.Institucion }],
  rf: { listar: 'RF-002', consultar: 'RF-002', crear: 'RF-001', modificar: 'RF-003', eliminar: 'RF-004' },
});
