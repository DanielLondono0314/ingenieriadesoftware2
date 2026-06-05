# Bitácora de Avance Semanal

## Registro de Avance

| Semana | Fecha | Actividad Realizada | Estado |
|--------|-------|--------------------|---------| 
| 1 | 2025-02-10 | Análisis del problema. Planteamiento e Ishikawa. | ✅ Completo |
| 2 | 2025-02-17 | Alcance, objetivo general y objetivos específicos. | ✅ Completo |
| 3 | 2025-02-24 | Técnicas de elicitación. Levantamiento de HU. | ✅ Completo |
| 4 | 2025-03-03 | 23 RF con CRUD y 15 RNF con métricas. | ✅ Completo |
| 5 | 2025-03-10 | CU-001 a CU-005 con flujos alternativos. | ✅ Completo |
| 6 | 2025-03-17 | Fase 1: Tablas de contexto e interacciones (E1-E2). | ✅ Completo |
| 7 | 2025-03-24 | Fase 1: DCA, arquetipos y componentes (E3-E5). | ✅ Completo |
| 8 | 2025-03-31 | Fase 1: Diagrama de despliegue (E6). | ✅ Completo |
| 9 | 2025-04-07 | Fase 2: Diccionario de datos y MER Conceptual (E7-E8). | ✅ Completo |
| 10 | 2025-04-14 | Fase 2: Modelo relacional y normalización 3FN (E9-E10). | ✅ Completo |
| 11 | 2025-04-21 | Fase 2: Script DDL PostgreSQL completo (E11). | ✅ Completo |
| 12 | 2025-04-28 | Fase 3: Diagrama de clases y secuencias (E12-E13). | ✅ Completo |
| 13 | 2025-05-05 | Fase 3: Diagrama de estados (E14). | ✅ Completo |
| 14 | 2025-05-12 | Fase 4: Mapa de navegación y wireframes (E15-E16). | ✅ Completo |
| 15 | 2025-05-19 | Fase 4: Prototipo de alta fidelidad (E17). | ✅ Completo |
| 16 | 2025-05-26 | 13 matrices de trazabilidad (M1-M13). | ✅ Completo |

---

## Programación con Framework — Trabajo Parcial 1 (2026)

| Semana | Fecha | Actividad Realizada | Estado |
|--------|-------|--------------------|---------|
| 1 | 2026-04-17 | Framework Express + Sequelize corriendo, estructura `src/`, README y bitácora | ✅ Completo |
| 2 | 2026-04-25 | Base de datos creada desde DDL, 12 modelos ORM con asociaciones (FKs y aliases) | ✅ Completo |
| 3 | 2026-05-02 | CRUD de tablas maestras (ROL, NIVEL_EDUCATIVO, TIPO_CONTENIDO, TIPO_ACTIVIDAD, INSTITUCION) + DECISIONES.md con 4 entradas | ✅ Completo |
| 4 | 2026-05-09 | CRUD de tablas transaccionales (USUARIO, MATRICULA, MODULO, ACTIVIDAD, PROGRESO_ESTUDIANTE, HISTORIAL_PRACTICA, REPORTE) con FKs activas | ✅ Completo |
| 5 | 2026-05-16 | Trazabilidad Diseño→Código en todo el backend + 2 reglas de negocio (capa de servicios, E14-DE02/DE03) | ✅ Completo |

---

## Entradas (formato obligatorio)

## Entrada #01 — 2026-04-17
**¿Qué hice?** Inicialicé el framework Express + Sequelize, creé la estructura `src/`
(config, models, routes, middleware, utils) basada en el Diagrama de Componentes (E5) y dejé
el servidor corriendo localmente con `GET /api/health`. README y primera bitácora.
**¿Qué problema encontré?** Sequelize pluralizaba los nombres de tabla y rompía el mapeo con
el DDL (E11), que usa nombres en singular y MAYÚSCULAS.
**¿Cómo lo resolví?** Configuré `freezeTableName: true` y `define` con el nombre exacto de
cada tabla, dejando el esquema en manos del DDL.
**¿Usé IA? Sí** — Pedí el esqueleto de `server.js`; ajusté el orden de los middlewares
(el `errorHandler` debe ir al final) y el `404` antes del handler de errores.

## Entrada #02 — 2026-04-25
**¿Qué hice?** Ejecuté el DDL para crear la base de datos y modelé las 12 entidades ORM con
sus asociaciones (E9-E10): FK, `onDelete: CASCADE` y alias (`docente`, `estudiante`, `autor`)
para los dos FK que apuntan a USUARIO.
**¿Qué problema encontré?** Al haber dos FK desde MODULO/ACTIVIDAD hacia USUARIO, Sequelize
generaba un alias ambiguo y los `include` fallaban.
**¿Cómo lo resolví?** Declaré cada `belongsTo` con `as:` explícito y usé el mismo alias en los
`include` de las rutas.
**¿Usé IA? Sí** — Generé el borrador de las asociaciones; corregí los `foreignKey` para que
coincidieran con los nombres de columna `snake_case` del DDL (p. ej. `id_generado_por`).

## Entrada #03 — 2026-05-02
**¿Qué hice?** CRUD de las 5 tablas maestras mediante un factory genérico
(`buildCrudRouter`) y hash de contraseñas con bcrypt en hooks del modelo USUARIO (RNF-004).
Documenté 4 decisiones en DECISIONES.md.
**¿Qué problema encontré?** El hash se recalculaba en cada `update`, aunque la contraseña no
cambiara.
**¿Cómo lo resolví?** Apliqué el hash solo cuando `user.changed('contrasena')` y oculté el
campo con un `toJSON()` que lo elimina de la respuesta.
**¿Usé IA? No** — Lo implementé directo apoyándome en la documentación de Sequelize.

## Entrada #04 — 2026-05-09
**¿Qué hice?** CRUD de las 7 tablas transaccionales con sus FK activas y `include` de
relaciones. Verifiqué en consola que las maestras se resuelven desde las transaccionales.
**¿Qué problema encontré?** El `POST /api/usuarios` devolvía 500 al violar el `UNIQUE` de
`correo` sin un mensaje claro.
**¿Cómo lo resolví?** Centralicé el manejo en `errorHandler` y validé `isEmail` en el modelo;
queda pendiente mapear el error de Sequelize a un 409.
**¿Usé IA? Sí** — Pedí ejemplos de `include` anidado; ajusté los alias para que no chocaran
con los del modelo.

## Entrada #05 — 2026-05-16
**¿Qué hice?** Añadí la **trazabilidad Diseño→Código**: cada ruta y método de negocio lleva
un comentario `// CU | RF | E12/E13/E14` que lo vincula con el diseño, y completé las
respuestas obligatorias del README.
**¿Qué problema encontré?** Reflexión: el CRUD genérico cumple las semanas 3-4 pero todavía
no hay reglas de negocio (evaluar actividad, completar progreso, no borrar historial), que el
diseño sí define en E12/E14.
**¿Cómo lo resolví?** Lo dejé identificado como el siguiente bloque de trabajo (capa de
servicios) para cumplir las semanas 5-6.
**¿Usé IA? Sí** — Para revisar que los comentarios de trazabilidad apuntaran al RF/CU correcto
según las matrices M1 y M9.

## Entrada #06 — 2026-05-16
**¿Qué hice?** Implementé 2 reglas de negocio en una capa de servicios (`src/services/`):
(1) `POST /progresos/:id/completar` con la transición `en_progreso → completado` (E14-DE02) y
(2) `DELETE /usuarios/:id` que protege el historial académico (E14-DE03). Agregué clases de
error (`NotFoundError`/`ConflictError`/`BusinessRuleError`) para devolver 404/409/422.
**¿Qué problema encontré?** El router CRUD genérico ya definía `DELETE /usuarios/:id`, así que
mi override no se ejecutaba.
**¿Cómo lo resolví?** Monté las rutas de negocio **antes** del `buildCrudRouter` en
`routes/index.js`, aprovechando que Express resuelve por orden de declaración.
**¿Usé IA? Sí** — Generé el borrador de los servicios; ajusté que `puntaje_maximo` se leyera
del `include` de Actividad y validé los nombres de columna `snake_case`.

## Entrada #07 — 2026-05-16
**¿Qué hice?** Para que la Regla 2 fuera fiel a E14-DE03, añadí la columna `estado` a USUARIO
(DDL E11 + modelo) con los 5 estados del ciclo de vida y convertí el `DELETE /usuarios/:id` en
una desactivación lógica (`activo → inactivo`) que conserva el historial.
**¿Qué problema encontré?** El borrado físico (409 si tenía historial) no representaba el
estado INACTIVO del diagrama; faltaba dónde guardar ese estado.
**¿Cómo lo resolví?** Agregué `estado VARCHAR(20)` con `CHECK`/`isIn`, default `'activo'`, y el
servicio ahora hace `save()` del nuevo estado en vez de `destroy()`. Documenté el cambio de
esquema en DECISIONES (D-006).
**¿Usé IA? Sí** — Para revisar que el `CHECK` del DDL y el `isIn` del modelo listaran los
mismos 5 estados de E14-DE03.

## Entrada #08 — 2026-06-05
**¿Qué hice?** Construí la capa de presentación (frontend SPA en `public/`, servida por Express):
aula del estudiante (explorar módulos, realizar actividades con retroalimentación inmediata y ver
progreso — CU-001) y panel del docente (CRUD de las entidades + reglas de negocio). Además, tras la
revisión de la docente, incorporé las tablas `PREGUNTA` y `OPCION_RESPUESTA` (DDL E11 + modelos +
rutas + endpoint anidado `GET /actividades/:id/preguntas`) para que las preguntas y su evaluación
automática sean reales (CU-001 paso 5-6, RF-012, RF-016).
**¿Qué problema encontró?** (1) El `CHECK` de `correo` y el `isEmail` del modelo rechazaban dominios
con TLD no estándar (p. ej. `.k12`). (2) El reproductor de actividades dependía de un banco de
preguntas en el cliente, incoherente con CU-001.
**¿Cómo lo resolví?** (1) Usé dominios válidos (`@aula.edu.co`) al sembrar perfiles. (2) Modelé
`PREGUNTA`/`OPCION_RESPUESTA` y conecté el frontend al endpoint real, dejando el banco local solo
como respaldo. Documenté el cambio en DECISIONES (D-007) y actualicé E8/E11.
**¿Usé IA? Sí** — Generé el andamiaje de la SPA y los modelos; ajusté las asociaciones aliased
(`as: 'preguntas'`/`'opciones'`), el orden de las opciones y la trazabilidad de cada método.

---

## Correcciones Aplicadas

| Fecha | Corrección | Archivo Afectado |
|-------|-----------|-----------------|
| 2025-04-14 | Eliminar tiempo_empleado del esquema (3FN) | E10-normalizacion-3FN.md · E11-script-DDL.sql |
| 2025-04-14 | Eliminar modulos_completados del esquema (3FN) | E10-normalizacion-3FN.md · E11-script-DDL.sql |
| 2025-04-14 | Crear tabla NIVEL_EDUCATIVO (1FN) | E9-modelo-relacional.md · E11-script-DDL.sql |
| 2025-04-21 | Añadir campo codigo_nie a NIVEL_EDUCATIVO | E7-diccionario-datos.md · E9-modelo-relacional.md |
| 2026-05-16 | Añadir columna `estado` a USUARIO (ciclo de vida E14-DE03) | E7-diccionario-datos.md · E11-script-DDL.sql · src/models/Usuario.js |
| 2026-06-05 | Incorporar tablas PREGUNTA y OPCION_RESPUESTA (coherencia CU-001, D-007) | E8-modelo-entidad-relacion.md · E11-script-DDL.sql · src/models/Pregunta.js · src/models/OpcionRespuesta.js |
