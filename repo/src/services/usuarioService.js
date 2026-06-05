const { Usuario } = require('../models');
const { NotFoundError, ConflictError } = require('../errors/AppError');

// CU-002 | RF-004 | E12-Usuario.desactivar() · E14-DE03
//
// Regla de negocio #2 — Desactivación lógica que protege el historial académico.
// Fiel a E14-DE03: desactivar() pasa el usuario de 'activo' → 'inactivo' SIN borrarlo
// físicamente, de modo que su historial académico (PROGRESO_ESTUDIANTE / HISTORIAL_PRACTICA)
// se conserva siempre ("el historial NUNCA se borra"). Solo se permite la transición
// desde un estado activable; si ya está inactivo/eliminado se devuelve 409.
async function desactivarUsuario(idUsuario) {
  const usuario = await Usuario.findByPk(idUsuario);
  if (!usuario) {
    throw new NotFoundError(`No existe el usuario ${idUsuario}`);
  }

  if (usuario.estado === 'inactivo' || usuario.estado === 'eliminado_logico') {
    throw new ConflictError(`El usuario ya está '${usuario.estado}'; no admite desactivarse`);
  }

  usuario.estado = 'inactivo';
  await usuario.save();
  return usuario;
}

module.exports = { desactivarUsuario };
