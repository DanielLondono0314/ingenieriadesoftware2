const { NotFoundError, ForbiddenError } = require('../errors/AppError');

// E5-Componentes (controlador genérico) · M3 — operaciones CRUD de un recurso.
// Cada controlador concreto declara qué RF origina cada operación (`rf`), de modo que la
// trazabilidad RF → método → endpoint queda en el código y no se repite un mismo RF para todo.
//   propio: { campo, roles, escritura, libreCrear }
//     roles       → solo ven/modifican filas donde fila[campo] === id del usuario autenticado
//     escritura   → restringidos únicamente al modificar/eliminar
//     libreCrear  → al crear pueden fijar el campo (p. ej. docente notifica a un estudiante)
//   sanearCrear / sanearModificar: (req, body) => body — fuerzan campos según quién llama
function crearCrudController(Model, opts = {}) {
  const { include = [], listWhere, propio, sanearCrear, sanearModificar, rf = {} } = opts;

  const en = (req, lista) => !!(propio && req.user && (lista || []).includes(req.user.rol));
  const restringido = (req) => en(req, propio && propio.roles);
  const restringidoEscritura = (req) => restringido(req) || en(req, propio && propio.escritura);
  const ajeno = (req, fila, escritura) =>
    (escritura ? restringidoEscritura(req) : restringido(req)) &&
    Number(fila[propio.campo]) !== req.user.id;

  async function buscar(req, escritura) {
    const fila = await Model.findByPk(req.params.id, { include: escritura ? [] : include });
    if (!fila) throw new NotFoundError('No encontrado');
    if (ajeno(req, fila, escritura)) throw new ForbiddenError();
    return fila;
  }

  // RF de consulta (listar)
  async function listar(req, res, next) {
    try {
      const where = { ...(listWhere || {}) };
      if (restringido(req)) where[propio.campo] = req.user.id;
      res.json(await Model.findAll({ where, include }));
    } catch (err) { next(err); }
  }

  // RF de consulta (por id)
  async function consultar(req, res, next) {
    try { res.json(await buscar(req, false)); } catch (err) { next(err); }
  }

  // RF de creación → 201
  async function crear(req, res, next) {
    try {
      let body = { ...req.body };
      if (restringido(req) && !en(req, propio.libreCrear)) body[propio.campo] = req.user.id;
      if (sanearCrear) body = sanearCrear(req, body);
      res.status(201).json(await Model.create(body));
    } catch (err) { next(err); }
  }

  // RF de modificación → 200
  async function modificar(req, res, next) {
    try {
      const fila = await buscar(req, true);
      let body = { ...req.body };
      if (restringidoEscritura(req)) body[propio.campo] = req.user.id;
      if (sanearModificar) body = sanearModificar(req, body);
      await fila.update(body);
      res.json(fila);
    } catch (err) { next(err); }
  }

  // RF de eliminación → 204
  async function eliminar(req, res, next) {
    try {
      const fila = await buscar(req, true);
      await fila.destroy();
      res.status(204).end();
    } catch (err) { next(err); }
  }

  return { listar, consultar, crear, modificar, eliminar, rf };
}

module.exports = { crearCrudController };
