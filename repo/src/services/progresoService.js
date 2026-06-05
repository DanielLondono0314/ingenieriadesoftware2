const { ProgresoEstudiante, Actividad } = require('../models');
const { NotFoundError, ConflictError, BusinessRuleError } = require('../errors/AppError');

// CU-001 | RF-016,RF-017,RF-018,RF-020 | E12-ProgresoEstudiante.completar() · E14-DE02
//
// Regla de negocio #1 — Completar una actividad.
// El progreso solo puede pasar de 'en_progreso' → 'completado' (transición DE-02).
// El puntaje obtenido no puede superar el puntaje_maximo de la actividad (E12-Actividad.evaluar()).
async function completarProgreso(idProgreso, puntaje) {
  const progreso = await ProgresoEstudiante.findByPk(idProgreso, {
    include: [{ model: Actividad }],
  });

  if (!progreso) {
    throw new NotFoundError(`No existe el progreso ${idProgreso}`);
  }

  // Transición inválida: ya está completado (DE-02 no permite completar() desde COMPLETADO)
  if (progreso.estado === 'completado') {
    throw new ConflictError('El progreso ya está completado; no admite re-completarse');
  }

  // El modelo se define como 'actividad', por eso la asociación se accede en minúscula
  const puntajeMaximo = progreso.actividad.puntaje_maximo;
  if (puntaje < 0 || puntaje > puntajeMaximo) {
    throw new BusinessRuleError(
      `El puntaje debe estar entre 0 y ${puntajeMaximo} (puntaje_maximo de la actividad)`
    );
  }

  progreso.puntaje_obtenido = puntaje;
  progreso.estado = 'completado';
  progreso.fecha_realizacion = new Date();
  await progreso.save();

  return progreso;
}

module.exports = { completarProgreso };
