const { AppError } = require('../errors/AppError');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Errores de negocio lanzados por la capa de servicios (404/409/422)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.name, mensaje: err.message });
  }
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: err.name,
      detalles: err.errors.map((e) => ({ campo: e.path, mensaje: e.message })),
    });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ error: 'Violación de llave foránea', detalle: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno', mensaje: err.message });
}

module.exports = errorHandler;
