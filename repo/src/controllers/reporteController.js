const m = require('../models');
const { generarReporte } = require('../services/reporteService');
const { crearCrudController } = require('./crudController');

// CU-005 | RF-022, RF-023 | E12-Reporte · E13-Reporte · M1(EC-06) · M9
const crud = crearCrudController(m.Reporte, {
  include: [{ model: m.Usuario, as: 'autor' }, { model: m.Institucion }],
  rf: { crear: 'RF-022', listar: 'RF-023', consultar: 'RF-023', modificar: 'RF-022', eliminar: 'RF-022' },
});

// RF-022, RF-023 | RNF-013 — POST /api/reportes/generar: crea el PDF/Excel y registra el REPORTE.
// El autor sale del token, no del cuerpo.
async function generar(req, res, next) {
  try {
    res.status(201).json(await generarReporte({ ...req.body, id_generado_por: req.user.id }));
  } catch (err) { next(err); }
}

module.exports = { ...crud, generar };
