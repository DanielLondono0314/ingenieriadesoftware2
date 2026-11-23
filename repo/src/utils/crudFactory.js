const { Router } = require('express');
const { AppError } = require('../errors/AppError');
const { autenticar, autenticarOpcional, requerirRol } = require('../middleware/auth');

// E5-Componentes (controlador genérico) · M3 — CRUD reutilizable.
// RF-006 | autorización por rol:
//   acceso: { listar, consultar, crear, modificar, eliminar } con 'publico' | 'auth' | [ids de rol]
//   propio: { campo, roles } — esos roles solo ven/modifican filas donde fila[campo] === su id
//   sanearCrear / sanearModificar: (req, body) => body — fuerzan campos según quién llama
function guard(spec) {
  if (spec === 'publico') return [autenticarOpcional];
  if (spec === 'auth' || !spec) return [autenticar];
  return [autenticar, requerirRol(...spec)];
}

function buildCrudRouter(Model, opts = {}) {
  const { include = [], listWhere, acceso = {}, propio, sanearCrear, sanearModificar } = opts;
  const router = Router();
  // propio.roles: restringidos en todo · propio.escritura: restringidos solo al modificar/eliminar
  // propio.libreCrear: roles que al crear pueden fijar el campo (p. ej. docente notifica a estudiantes)
  const en = (req, lista) => propio && req.user && (lista || []).includes(req.user.rol);
  const restringido = (req) => en(req, propio && propio.roles);
  const restringidoEscritura = (req) => restringido(req) || en(req, propio && propio.escritura);
  const ajeno = (req, row, escritura) =>
    (escritura ? restringidoEscritura(req) : restringido(req)) && Number(row[propio.campo]) !== req.user.id;

  router.get('/', guard(acceso.listar), async (req, res, next) => {
    try {
      const where = { ...(listWhere || {}) };
      if (restringido(req)) where[propio.campo] = req.user.id;
      res.json(await Model.findAll({ where, include }));
    } catch (err) { next(err); }
  });

  router.get('/:id', guard(acceso.consultar), async (req, res, next) => {
    try {
      const row = await Model.findByPk(req.params.id, { include });
      if (!row) return res.status(404).json({ error: 'No encontrado' });
      if (ajeno(req, row)) throw new AppError('No tiene permisos sobre este recurso', 403);
      res.json(row);
    } catch (err) { next(err); }
  });

  router.post('/', guard(acceso.crear), async (req, res, next) => {
    try {
      let body = { ...req.body };
      if (restringido(req) && !en(req, propio.libreCrear)) body[propio.campo] = req.user.id;
      if (sanearCrear) body = sanearCrear(req, body);
      res.status(201).json(await Model.create(body));
    } catch (err) { next(err); }
  });

  router.put('/:id', guard(acceso.modificar), async (req, res, next) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ error: 'No encontrado' });
      if (ajeno(req, row, true)) throw new AppError('No tiene permisos sobre este recurso', 403);
      let body = { ...req.body };
      if (restringidoEscritura(req)) body[propio.campo] = req.user.id;
      if (sanearModificar) body = sanearModificar(req, body);
      await row.update(body);
      res.json(row);
    } catch (err) { next(err); }
  });

  router.delete('/:id', guard(acceso.eliminar), async (req, res, next) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ error: 'No encontrado' });
      if (ajeno(req, row, true)) throw new AppError('No tiene permisos sobre este recurso', 403);
      await row.destroy();
      res.status(204).end();
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = { buildCrudRouter };
