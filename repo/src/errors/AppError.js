// E5-Componentes (manejo de errores) — clases de error con status HTTP semántico.
// Permiten que la capa de servicios lance errores de negocio y que el errorHandler
// los traduzca al código correcto (404, 409, 422) sin usar `throw new Error` genérico.

class AppError extends Error {
  constructor(mensaje, statusCode) {
    super(mensaje);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// 404 — recurso inexistente
class NotFoundError extends AppError {
  constructor(mensaje = 'Recurso no encontrado') {
    super(mensaje, 404);
  }
}

// 409 — la operación choca con el estado actual (transición/regla de negocio)
class ConflictError extends AppError {
  constructor(mensaje = 'Conflicto con el estado actual del recurso') {
    super(mensaje, 409);
  }
}

// 422 — datos válidos en forma pero que violan una regla de negocio
class BusinessRuleError extends AppError {
  constructor(mensaje = 'Regla de negocio no satisfecha') {
    super(mensaje, 422);
  }
}

module.exports = { AppError, NotFoundError, ConflictError, BusinessRuleError };
