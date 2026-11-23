# M14 — Matriz de trazabilidad de construcción
RF → HU → tabla (DDL) → clase.método (`src/`) → endpoint (`src/routes/index.js`) → pantalla (`public/app.js`). Roles: E estudiante, D docente, A administrador. Cada controlador declara en el código el RF de cada operación (propiedad `rf` de `crudController`).

| RF | HU | Tabla | Clase.método | Endpoint (rol) | Pantalla | Estado |
|---|---|---|---|---|---|---|
| RF-001 | HU-001, 014 | usuario, matricula | usuarioController.crear (crudController, sanearCrear) | POST /api/usuarios (público: autorregistro como estudiante; A: cualquier rol) | SCR-02 Registro (renderGate 'registro'); Usuarios › + Nuevo (renderView/openForm) | Implementado |
| RF-002 | HU-002, 014 | usuario | usuarioController.listar, .consultar | GET /api/usuarios (D, A); GET /api/usuarios/:id (sesión; E solo el suyo) | Usuarios (renderView 'usuarios') | Implementado |
| RF-003 | HU-009, 015 | usuario | usuarioController.modificar (sanearModificar: nadie se auto-eleva el rol) | PUT /api/usuarios/:id (propio; A cualquiera) | Usuarios › Editar (openForm) | Implementado |
| RF-004 | HU-015 | usuario.estado | usuarioController.desactivar → usuarioService.desactivarUsuario | DELETE /api/usuarios/:id (A) | Usuarios › Desactivar (deleteRow) | Implementado |
| RF-005 | HU-002 | usuario | authController.iniciarSesion → authService.login | POST /api/auth/login (público); middleware auth.autenticar en el resto | SCR-01 Login (renderGate 'login'); SCR-03 solo muestra aviso | Implementado |
| RF-006 | HU-018 | rol | rolController.* ; auth.requerirRol (routes/index.js) | /api/roles (A escribe; sesión lee) | Roles (renderView 'roles') = SCR-32 | Parcial: roles 4 y 5 sin permisos propios |
| RF-007 | HU-016 | modulo, tipo_contenido, nivel_educativo | moduloController.crear; tipoContenidoController; nivelEducativoController | POST /api/modulos (D, A); catálogos: A | Módulos › + Nuevo = SCR-29/30 | Implementado (desvío: la HU dice solo administrador) |
| RF-008 | HU-003, 016 | modulo | moduloController.listar, .consultar | GET /api/modulos[/:id] (sesión) | SCR-06 Catálogo (renderExplorar); Módulos (renderView) | Implementado |
| RF-009 | HU-016 | modulo | moduloController.modificar | PUT /api/modulos/:id (D, A) | Módulos › Editar (openForm) | Implementado (mismo desvío que RF-007) |
| RF-010 | HU-016 | modulo | moduloController.eliminar | DELETE /api/modulos/:id (D, A) | Módulos › Eliminar (deleteRow) | Implementado (mismo desvío que RF-007) |
| RF-011 | HU-003, 007 | modulo | moduloController.consultar | GET /api/modulos/:id | SCR-07 Detalle módulo (renderModulo): texto y lista de actividades | No implementado: sin explicaciones visuales ni animadas |
| RF-012 | HU-010 | actividad, pregunta, opcion_respuesta, tipo_actividad | actividadController.crear; preguntaController.crear; opcionController.crear | POST /api/actividades, /api/preguntas, /api/opciones (D, A) | SCR-18 Crear actividad (renderCrearActividad); Actividades (renderView) | Implementado |
| RF-013 | HU-004, 010 | actividad | actividadController.listar, .consultar | GET /api/actividades[/:id] (sesión) | SCR-07 (renderModulo); SCR-17 Actividades (renderView) | Implementado |
| RF-014 | HU-013 | actividad, pregunta | actividadController.modificar; preguntaController.modificar | PUT /api/actividades/:id (D, A) | SCR-17 › Editar (openForm) | Implementado |
| RF-015 | HU-013 | actividad | actividadController.eliminar | DELETE /api/actividades/:id (D, A) | SCR-17 › Eliminar (deleteRow) | Implementado |
| RF-016 | HU-004, 006 | actividad, pregunta, opcion_respuesta, progreso_estudiante | actividadController.preguntasDeActividad; progresoController.responder → evaluacionService.responderActividad | GET /api/actividades/:id/preguntas; POST /api/progresos/:id/responder (E solo el suyo; D, A) | SCR-08 Actividad interactiva y SCR-09 Resultado (renderActividad) | Implementado |
| RF-017 | HU-008 | progreso_estudiante | progresoController.crear (propio); progresoService.completarProgreso | POST /api/progresos; POST /api/progresos/:id/completar | renderActividad: crea el progreso al empezar y lo completa al finalizar | Parcial: sin autoguardado por pregunta |
| RF-018 | HU-005, 006 | historial_practica, notificacion | historialController.crear; progresoService.completarProgreso (crea la notificación) | POST /api/historiales (sesión; el dueño sale del token) | renderActividad (registra el historial al finalizar); SCR-13 Notificaciones | Parcial: el historial lo crea el cliente, no el servidor |
| RF-019 | HU-005, 011 | historial_practica, notificacion | historialController.listar, .consultar; notificacionController.listar | GET /api/historiales (E solo los suyos; D, A todos) | SCR-10/11 Mi progreso (renderMiProgreso); SCR-19 Seguimiento (renderSeguimiento) | Implementado |
| RF-020 | HU-005 | progreso_estudiante | progresoController.listar, .modificar | GET/PUT /api/progresos[/:id] (E solo los suyos; modificar D, A) | SCR-10 Mi progreso (renderMiProgreso) | Implementado |
| RF-021 | HU-017 | historial_practica | historialController.eliminar | DELETE /api/historiales/:id (solo A, desde commit aed1166) | Historial de práctica (renderView 'historiales') | Implementado |
| RF-022 | HU-012 | reporte | reporteController.generar → reporteService.generarReporte | POST /api/reportes/generar (D, A); GET /api/reportes/<archivo> (D, A) | SCR-21/22 Generar reporte (renderReporteGen) | Implementado |
| RF-023 | HU-017 | reporte | reporteController.generar (tipo 'global'); reporteController.listar | POST /api/reportes/generar con tipo=global (D, A); GET /api/reportes (D, A) | SCR-31 Reportes (renderReporteGen, tipo Global) | Implementado |

## Funcionalidad sin RF
| Funcionalidad | Tablas | Código | Observación |
|---|---|---|---|
| Instituciones y matrículas (CRUD) | institucion, matricula | institucionController, matriculaController | SCR-33 Instituciones; se justifican por EC-09 (RF-001/002) pero ningún RF las nombra como funcionalidad |
| Catálogos de nivel, tipo de contenido y tipo de actividad | nivel_educativo, tipo_contenido, tipo_actividad | nivelEducativoController, tipoContenidoController, tipoActividadController | Soporte de RF-007/012 (normalización 3FN); sin RF propio |
| Vista 'Reglas de negocio' (renderRules) | progreso_estudiante | progresoController.completar | Demostración de la regla E14-DE02; sin RF ni SCR |
| GET /api/health y scripts/seed-demo.js | — | server.js, scripts/seed-demo.js | Soporte operativo (disponibilidad RNF-003 y datos de demo); sin RF |

## Pantallas del mapa E15 frente a las construidas
| Pantalla | Función en app.js | Estado |
|---|---|---|
| SCR-01 Login | renderGate('login') | Construida (commit af052f5) |
| SCR-02 Registro | renderGate('registro') | Construida |
| SCR-03 Recuperar password | renderGate('recuperar') | Parcial: solo muestra aviso 'no disponible' |
| SCR-04 Dashboard estudiante | renderExplorar | Construida (equivalente: catálogo con progreso) |
| SCR-05 Mi perfil | — | No construida |
| SCR-06 Catálogo de módulos | renderExplorar | Construida |
| SCR-07 Detalle módulo | renderModulo | Construida |
| SCR-08 Actividad interactiva | renderActividad | Construida |
| SCR-09 Resultado | renderActividad (vista de resultado) | Construida |
| SCR-10 Mi progreso | renderMiProgreso | Construida |
| SCR-11 Historial completo | renderMiProgreso | Parcial: dentro de Mi progreso |
| SCR-12 Retroalimentación | renderActividad | Parcial: retroalimentación por pregunta dentro de la actividad |
| SCR-13 Notificaciones | renderNotificaciones | Construida |
| SCR-14 Configuración de cuenta | — | No construida |
| SCR-15 Dashboard docente | renderDashboard | Construida |
| SCR-16 Perfil docente | — | No construida |
| SCR-17 Gestión actividades | renderView('actividades') | Construida |
| SCR-18 Crear/editar actividad | renderCrearActividad | Construida |
| SCR-19 Seguimiento del grupo | renderSeguimiento | Construida |
| SCR-20 Detalle estudiante | — | No construida |
| SCR-21 Exportar reporte | renderReporteGen | Construida |
| SCR-22 Preview/descarga | renderReporteGen | Construida |
| SCR-23 Asignar actividades | — | No construida (se notifica al crear la actividad) |
| SCR-24 Calendario académico | — | No construida |
| SCR-25 Dashboard admin | renderDashboard | Construida |
| SCR-26 Perfil admin | — | No construida |
| SCR-27 Gestión usuarios | renderView('usuarios') | Construida |
| SCR-28 Crear/editar usuario | openForm('usuarios') | Construida |
| SCR-29 Gestión módulos | renderView('modulos') | Construida |
| SCR-30 Crear/editar módulo | openForm('modulos') | Construida |
| SCR-31 Reportes globales | renderReporteGen (tipo global) | Parcial: comparte pantalla con el reporte docente |
| SCR-32 Config. roles | renderView('roles') | Construida |
| SCR-33 Instituciones | renderView('instituciones') | Construida |
| SCR-34 Log de seguridad | — | No construida (el log existe en logs/seguridad.log, sin pantalla) |
| SCR-35 Config. sistema | — | No construida |
