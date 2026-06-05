const { Router } = require('express');

// E5-Componentes (controlador genérico) · M3 — CRUD reutilizable para las 12 entidades.
// Implementa las operaciones REST que origina cada RF de gestión (crear/consultar/
// modificar/eliminar) descritas en E13 (Diagramas de Secuencia).
// `listWhere`: filtro opcional aplicado solo al listado (p. ej. ocultar usuarios inactivos).
function buildCrudRouter(Model, { pkField, include = [], listWhere } = {}) {
  const router = Router();
  const pk = pkField || Model.primaryKeyAttribute;

  // RF-008/RF-019 | E13 — listar() / consultar()
  router.get('/', async (req, res, next) => {
    try {
      const rows = await Model.findAll({ where: listWhere, include });
      res.json(rows);
    } catch (err) { next(err); }
  });

  // RF-008 | E13 — consultar(id)
  router.get(`/:id`, async (req, res, next) => {
    try {
      const row = await Model.findByPk(req.params.id, { include });
      if (!row) return res.status(404).json({ error: 'No encontrado' });
      res.json(row);
    } catch (err) { next(err); }
  });

  // RF-007/RF-012 | E13 — crear() → 201 Created
  router.post('/', async (req, res, next) => {
    try {
      const row = await Model.create(req.body);
      res.status(201).json(row);
    } catch (err) { next(err); }
  });

  // RF-009/RF-014 | E13 — modificar() → 200 OK
  router.put('/:id', async (req, res, next) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ error: 'No encontrado' });
      await row.update(req.body);
      res.json(row);
    } catch (err) { next(err); }
  });

  // RF-010/RF-021 | E13 — eliminar() → 204 No Content
  router.delete('/:id', async (req, res, next) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return res.status(404).json({ error: 'No encontrado' });
      await row.destroy();
      res.status(204).end();
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = { buildCrudRouter };
