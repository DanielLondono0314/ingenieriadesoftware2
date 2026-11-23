const { Router } = require('express');
const { autenticar, autenticarOpcional, requerirRol } = require('../middleware/auth');

// Solo enruta: URL + verbo → middleware de acceso → método del controlador.
// acceso: { listar, consultar, crear, modificar, eliminar } con 'publico' | 'auth' | [ids de rol]
function acceso(spec) {
  if (spec === 'publico') return [autenticarOpcional];
  if (!spec || spec === 'auth') return [autenticar];
  return [autenticar, requerirRol(...spec)];
}

function crudRouter(ctrl, a = {}) {
  const router = Router();
  router.get('/', acceso(a.listar), ctrl.listar);
  router.get('/:id', acceso(a.consultar), ctrl.consultar);
  router.post('/', acceso(a.crear), ctrl.crear);
  router.put('/:id', acceso(a.modificar), ctrl.modificar);
  router.delete('/:id', acceso(a.eliminar), ctrl.eliminar);
  return router;
}

module.exports = { crudRouter, acceso };
