const m = require('../models');
const { crearCrudController } = require('./crudController');

// RF-006 | E12-Rol · M9 — gestión de roles y permisos
const RF = 'RF-006';
module.exports = crearCrudController(m.Rol, {
  rf: { listar: RF, consultar: RF, crear: RF, modificar: RF, eliminar: RF },
});
