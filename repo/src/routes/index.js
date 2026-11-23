const { Router } = require('express');
const { ROLES, autenticar, requerirRol } = require('../middleware/auth');
const { crudRouter } = require('./crudRouter');

const auth = require('../controllers/authController');
const rol = require('../controllers/rolController');
const nivel = require('../controllers/nivelEducativoController');
const tipoContenido = require('../controllers/tipoContenidoController');
const tipoActividad = require('../controllers/tipoActividadController');
const institucion = require('../controllers/institucionController');
const usuario = require('../controllers/usuarioController');
const matricula = require('../controllers/matriculaController');
const modulo = require('../controllers/moduloController');
const actividad = require('../controllers/actividadController');
const progreso = require('../controllers/progresoController');
const historial = require('../controllers/historialController');
const reporte = require('../controllers/reporteController');
const pregunta = require('../controllers/preguntaController');
const opcion = require('../controllers/opcionController');
const notificacion = require('../controllers/notificacionController');

// E5-Componentes · M3 — capa de rutas: solo mapea URL → middleware de acceso → controlador.
// No importa modelos ni contiene lógica de negocio (MVC: Modelo=src/models, Controlador=src/controllers,
// Servicios=src/services). La política de acceso por rol (RF-006) se declara aquí, endpoint por endpoint.
const { ESTUDIANTE: EST, DOCENTE: DOC, ADMIN: ADM } = ROLES;
const STAFF = [DOC, ADM];
const ADMIN_ESCRIBE = { crear: [ADM], modificar: [ADM], eliminar: [ADM] };
const STAFF_ESCRIBE = { crear: STAFF, modificar: STAFF, eliminar: STAFF };

const router = Router();

// ── Acciones de negocio (se montan antes de los CRUD para tener prioridad) ──
router.post('/auth/login', auth.iniciarSesion);                                              // RF-005
router.post('/progresos/:id/responder', autenticar, progreso.responder);                     // RF-016, RF-018
router.post('/progresos/:id/completar', autenticar, progreso.completar);                     // RF-016, RF-018
router.post('/reportes/generar', autenticar, requerirRol(...STAFF), reporte.generar);        // RF-022, RF-023
router.delete('/usuarios/:id', autenticar, requerirRol(ADM), usuario.desactivar);            // RF-004
router.get('/actividades/:id/preguntas', autenticar, actividad.preguntasDeActividad);        // RF-016

// ── Tablas maestras ──
router.use('/roles', crudRouter(rol, ADMIN_ESCRIBE));
router.use('/niveles-educativos', crudRouter(nivel, ADMIN_ESCRIBE));
router.use('/tipos-contenido', crudRouter(tipoContenido, ADMIN_ESCRIBE));
router.use('/tipos-actividad', crudRouter(tipoActividad, ADMIN_ESCRIBE));
router.use('/instituciones', crudRouter(institucion, ADMIN_ESCRIBE));

// ── Tablas transaccionales ──
router.use('/usuarios', crudRouter(usuario, {
  listar: STAFF, consultar: 'auth', crear: 'publico', modificar: 'auth', eliminar: [ADM],
}));
router.use('/matriculas', crudRouter(matricula, { listar: STAFF, consultar: STAFF, ...ADMIN_ESCRIBE }));
router.use('/modulos', crudRouter(modulo, STAFF_ESCRIBE));
router.use('/actividades', crudRouter(actividad, STAFF_ESCRIBE));
router.use('/progresos', crudRouter(progreso, { crear: 'auth', modificar: STAFF, eliminar: STAFF }));
router.use('/historiales', crudRouter(historial, { crear: 'auth', modificar: STAFF, eliminar: STAFF }));
router.use('/reportes', crudRouter(reporte, { listar: STAFF, consultar: STAFF, ...STAFF_ESCRIBE }));
router.use('/preguntas', crudRouter(pregunta, STAFF_ESCRIBE));
router.use('/opciones', crudRouter(opcion, STAFF_ESCRIBE));
router.use('/notificaciones', crudRouter(notificacion, { crear: 'auth' }));

module.exports = router;
