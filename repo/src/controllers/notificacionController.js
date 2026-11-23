const m = require('../models');
const { ROLES } = require('../middleware/auth');
const { crearCrudController } = require('./crudController');

// SCR-13 · DE-01 | RF-018 | E8-NOTIFICACION — avisos por usuario.
// Cada quien ve solo los suyos; el docente puede notificar a estudiantes.
module.exports = crearCrudController(m.Notificacion, {
  propio: { campo: 'id_usuario', roles: [ROLES.ESTUDIANTE, ROLES.DOCENTE], libreCrear: [ROLES.DOCENTE] },
  rf: { crear: 'RF-018', listar: 'RF-018', consultar: 'RF-018', modificar: 'RF-018', eliminar: 'RF-018' },
});
