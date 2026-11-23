const m = require('../models');
const { ROLES } = require('../middleware/auth');
const { crearCrudController } = require('./crudController');

// CU-001/CU-004 | RF-018, RF-019, RF-021 | E12-HistorialPractica · M9
module.exports = crearCrudController(m.HistorialPractica, {
  include: [{ model: m.Usuario, as: 'estudiante' }, { model: m.Modulo }],
  propio: { campo: 'id_estudiante', roles: [ROLES.ESTUDIANTE] },
  rf: { crear: 'RF-018', listar: 'RF-019', consultar: 'RF-019', modificar: 'RF-018', eliminar: 'RF-021' },
});
