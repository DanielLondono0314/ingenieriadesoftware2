const m = require('../models');
const { crearCrudController } = require('./crudController');

// CU-003 | RF-007 a RF-010 | E12-Modulo · E13-Actividad · M9 — módulos educativos
module.exports = crearCrudController(m.Modulo, {
  include: [{ model: m.TipoContenido }, { model: m.NivelEducativo }, { model: m.Usuario, as: 'docente' }],
  rf: { crear: 'RF-007', listar: 'RF-008', consultar: 'RF-008', modificar: 'RF-009', eliminar: 'RF-010' },
});
