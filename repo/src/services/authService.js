const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Usuario } = require('../models');
const { AppError } = require('../errors/AppError');
const { secreto, expiracion } = require('../config/jwt');

// CU-002 | RF-005 | RNF-004, RNF-005 | E12-Usuario.autenticar() · E13-Login · E14-DE03
//
// Autenticación con bloqueo temporal: 5 intentos fallidos consecutivos bloquean la
// cuenta 15 minutos (RNF-005) y cada bloqueo queda en el log de seguridad.
// Los contadores viven en memoria (no requieren cambiar el DDL); el estado visible
// del bloqueo se refleja en USUARIO.estado = 'bloqueado_temporal' (E14-DE03).
const MAX_INTENTOS = Number(process.env.LOGIN_MAX_INTENTOS) || 5;
const BLOQUEO_MS = (Number(process.env.LOGIN_BLOQUEO_MIN) || 15) * 60 * 1000;
const LOG_PATH = process.env.SECURITY_LOG || path.join(__dirname, '..', '..', 'logs', 'seguridad.log');

const intentos = new Map(); // id_usuario -> { fallos, bloqueadoHasta }

class AuthError extends AppError {
  constructor(mensaje, statusCode = 401) { super(mensaje, statusCode); }
}

function logSeguridad(evento, correo) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ${evento} ${correo}\n`);
  } catch (e) { console.error('[seguridad] no se pudo escribir el log:', e.message); }
}

function reiniciar() { intentos.clear(); }

async function login(correo, contrasena) {
  if (!correo || !contrasena) throw new AuthError('correo y contrasena son obligatorios', 400);
  const usuario = await Usuario.findOne({ where: { correo } });
  // Mensaje genérico: no revela si el correo existe.
  if (!usuario) throw new AuthError('Credenciales inválidas');

  if (usuario.estado === 'inactivo' || usuario.estado === 'eliminado_logico') {
    throw new AuthError('La cuenta no está activa', 403);
  }

  const reg = intentos.get(usuario.id_usuario) || { fallos: 0, bloqueadoHasta: 0 };
  if (usuario.estado === 'bloqueado_temporal') {
    if (reg.bloqueadoHasta > Date.now()) {
      throw new AuthError('Cuenta bloqueada temporalmente por intentos fallidos', 423);
    }
    // Bloqueo vencido (o servidor reiniciado): se reactiva.
    usuario.estado = 'activo';
    await usuario.save();
    reg.fallos = 0;
  }

  const ok = await usuario.verificarContrasena(contrasena);
  if (!ok) {
    reg.fallos += 1;
    if (reg.fallos >= MAX_INTENTOS) {
      reg.bloqueadoHasta = Date.now() + BLOQUEO_MS;
      usuario.estado = 'bloqueado_temporal';
      await usuario.save();
      logSeguridad('BLOQUEO', correo);
      intentos.set(usuario.id_usuario, reg);
      throw new AuthError('Cuenta bloqueada temporalmente por intentos fallidos', 423);
    }
    logSeguridad('LOGIN_FALLIDO', correo);
    intentos.set(usuario.id_usuario, reg);
    throw new AuthError('Credenciales inválidas');
  }

  intentos.delete(usuario.id_usuario);
  const token = jwt.sign(
    { sub: usuario.id_usuario, rol: usuario.id_rol },
    secreto(),
    { expiresIn: expiracion() }
  );
  return { token, usuario };
}

module.exports = { login, reiniciar, MAX_INTENTOS };
