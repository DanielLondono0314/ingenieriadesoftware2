const jwt = require('jsonwebtoken');
const { AppError } = require('../errors/AppError');
const { secreto } = require('../config/jwt');

// RF-005, RF-006 | RNF-004 | E13-Login — autenticación (JWT) y autorización por rol.
const ROLES = { ESTUDIANTE: 1, DOCENTE: 2, ADMIN: 3 };

function leerToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

function decodificar(token) {
  const p = jwt.verify(token, secreto());
  return { id: Number(p.sub), rol: Number(p.rol) };
}

// 401 si no hay token válido.
function autenticar(req, res, next) {
  const token = leerToken(req);
  if (!token) return next(new AppError('Autenticación requerida', 401));
  try {
    req.user = decodificar(token);
    next();
  } catch (e) {
    next(new AppError('Token inválido o expirado', 401));
  }
}

// Para rutas públicas que cambian de comportamiento si hay sesión (auto-registro).
function autenticarOpcional(req, res, next) {
  const token = leerToken(req);
  if (token) {
    try { req.user = decodificar(token); } catch (e) { /* se trata como anónimo */ }
  }
  next();
}

// 403 si el rol del token no está permitido.
const requerirRol = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return next(new AppError('No tiene permisos para esta operación', 403));
  }
  next();
};

module.exports = { ROLES, autenticar, autenticarOpcional, requerirRol };
