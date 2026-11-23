const { Op } = require('sequelize');
const m = require('../models');
const { ROLES } = require('../middleware/auth');
const { desactivarUsuario } = require('../services/usuarioService');
const { crearCrudController } = require('./crudController');

// CU-002 | RF-001 a RF-004 | E12-Usuario · E13-Login · E14-DE03
const crud = crearCrudController(m.Usuario, {
  include: [{ model: m.Rol }, { model: m.NivelEducativo }],
  // RF-002: el listado solo muestra usuarios vigentes (oculta inactivo/eliminado_logico)
  listWhere: { estado: { [Op.notIn]: ['inactivo', 'eliminado_logico'] } },
  // RF-006: el estudiante solo ve su cuenta; el docente solo modifica la suya
  propio: { campo: 'id_usuario', roles: [ROLES.ESTUDIANTE], escritura: [ROLES.DOCENTE] },
  // RF-001: sin sesión de administrador, el alta es auto-registro → siempre estudiante activo
  sanearCrear: (req, b) =>
    (req.user && req.user.rol === ROLES.ADMIN ? b : { ...b, id_rol: ROLES.ESTUDIANTE, estado: 'activo' }),
  // RF-003: nadie (salvo el administrador) se auto-eleva el rol ni cambia su estado
  sanearModificar: (req, b) => {
    if (req.user.rol === ROLES.ADMIN) return b;
    const { id_rol, estado, ...resto } = b;
    return resto;
  },
  rf: { listar: 'RF-002', consultar: 'RF-002', crear: 'RF-001', modificar: 'RF-003', eliminar: 'RF-004' },
});

// RF-004 | E12-Usuario.desactivar() · E14-DE03 — DELETE /api/usuarios/:id (baja lógica)
async function desactivar(req, res, next) {
  try { res.json(await desactivarUsuario(req.params.id)); } catch (err) { next(err); }
}

module.exports = { ...crud, desactivar };
