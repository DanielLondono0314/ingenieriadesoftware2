const { ProgresoEstudiante, Actividad, Pregunta, OpcionRespuesta } = require('../models');
const { NotFoundError, ConflictError, BusinessRuleError } = require('../errors/AppError');
const { completarProgreso } = require('./progresoService');

// CU-001 pasos 5-6 | RF-016, RF-018 | E8-PREGUNTA/OPCION_RESPUESTA · E12-Actividad.evaluar()
//
// Evaluación automática en el servidor: el puntaje se calcula comparando las opciones
// elegidas con es_correcta; el cliente ya no envía el puntaje. El resultado se escala
// al puntaje_maximo de la actividad y se completa el progreso (regla E14-DE02).
async function responderActividad(idProgreso, respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length === 0) {
    throw new BusinessRuleError('Debe enviar al menos una respuesta');
  }
  const progreso = await ProgresoEstudiante.findByPk(idProgreso, { include: [{ model: Actividad }] });
  if (!progreso) throw new NotFoundError(`No existe el progreso ${idProgreso}`);
  if (progreso.estado === 'completado') {
    throw new ConflictError('El progreso ya está completado; no admite re-completarse');
  }

  const preguntas = await Pregunta.findAll({
    where: { id_actividad: progreso.id_actividad },
    include: [{ model: OpcionRespuesta, as: 'opciones' }],
    order: [['orden', 'ASC']],
  });
  if (preguntas.length === 0) throw new BusinessRuleError('La actividad no tiene preguntas');

  const porPregunta = new Map(respuestas.map((r) => [Number(r.id_pregunta), Number(r.id_opcion)]));
  for (const [idP, idO] of porPregunta) {
    const p = preguntas.find((x) => x.id_pregunta === idP);
    if (!p) throw new BusinessRuleError(`La pregunta ${idP} no pertenece a la actividad`);
    if (!p.opciones.some((o) => o.id_opcion === idO)) {
      throw new BusinessRuleError(`La opción ${idO} no pertenece a la pregunta ${idP}`);
    }
  }

  let total = 0;
  let obtenido = 0;
  const detalle = preguntas.map((p) => {
    const peso = Number(p.puntaje);
    total += peso;
    const elegida = p.opciones.find((o) => o.id_opcion === porPregunta.get(p.id_pregunta));
    const correcta = !!(elegida && elegida.es_correcta);
    if (correcta) obtenido += peso;
    return {
      id_pregunta: p.id_pregunta,
      id_opcion: elegida ? elegida.id_opcion : null,
      correcta,
      retroalimentacion: p.retroalimentacion || null,
    };
  });

  const puntaje = Math.round((obtenido / total) * progreso.actividad.puntaje_maximo * 100) / 100;
  const completado = await completarProgreso(idProgreso, puntaje, detalle);
  return { progreso: completado, puntaje, aciertos: detalle.filter((d) => d.correcta).length, total_preguntas: preguntas.length, detalle };
}

module.exports = { responderActividad };
