# Decisiones Técnicas — Trabajo Parcial 1

Bitácora de decisiones de arquitectura e implementación tomadas durante la programación con framework. Cada entrada deja registrado el contexto, la decisión y la consecuencia.

---

## D-001 · Stack Node.js + Express + Sequelize

**Fecha:** 2026-04-25
**Estado:** Aceptada

**Contexto.** El README del proyecto declaraba un stack `React + Node.js + PostgreSQL 15 + S3`. Para la fase de programación con framework se requiere un backend que exponga CRUD sobre las 12 entidades del modelo 3FN (E11-script-DDL.sql) y que se integre directamente con PostgreSQL.

**Decisión.** Usar **Node.js 18 + Express 4 + Sequelize 6** como ORM contra PostgreSQL 15. Se descartó Prisma (la migración inicial generada a partir del DDL existente requería ajustes manuales en cada FK con alias) y TypeORM (curva de aprendizaje más alta para los plazos del parcial).

**Consecuencias.**
- ✅ Sequelize permite declarar asociaciones con alias (`as: 'docente'`, `as: 'estudiante'`) que reflejan los dos FKs hacia USUARIO desde MODULO/ACTIVIDAD/PROGRESO.
- ✅ El método `freezeTableName: true` evita que Sequelize pluralice los nombres y rompa el mapeo con el DDL.
- ⚠️ Sequelize no genera migraciones automáticas: el esquema se sigue creando con el script `E11-script-DDL.sql` y los modelos se mapean a las tablas existentes (sin `sync()` en producción).

---

## D-002 · El esquema lo crea el DDL, no `sequelize.sync()`

**Fecha:** 2026-04-25
**Estado:** Aceptada

**Contexto.** Sequelize permite generar las tablas automáticamente con `sync()`. Sin embargo el proyecto ya cuenta con un DDL formal (`docs/diseño/fase2-datos/E11-script-DDL.sql`) que incluye CHECKs, índices, una vista (`v_progreso_completo`), seeds y comentarios sobre normalización 3FN que `sync()` no reproduce.

**Decisión.** El esquema se crea **siempre** ejecutando el DDL (`npm run db:migrate`). Los modelos Sequelize **no** llaman `sync()` en ningún arranque. Si un modelo difiere del DDL, se considera bug del modelo, no del DDL.

**Consecuencias.**
- ✅ Una sola fuente de verdad del esquema: el archivo `.sql` versionado en `docs/`.
- ✅ Las restricciones avanzadas (CHECK del formato de correo, vista materializada, seeds de ROL/NIVEL/TIPO_*) se preservan.
- ⚠️ Cualquier cambio de esquema obliga a tocar **dos** archivos: el DDL y el modelo Sequelize. Se acepta el costo a cambio de no perder integridad declarativa.

---

## D-003 · Hash de contraseñas con bcrypt en hooks del modelo USUARIO

**Fecha:** 2026-05-02
**Estado:** Aceptada

**Contexto.** El RNF-004 exige que las contraseñas nunca se almacenen en texto plano. Los hooks de Sequelize permiten interceptar `beforeCreate`/`beforeUpdate` y aplicar la transformación en un único lugar.

**Decisión.** Se usa **bcryptjs** con factor de costo configurable por `BCRYPT_SALT_ROUNDS` (default 12). El hash se aplica únicamente cuando el campo `contrasena` cambió (`user.changed('contrasena')`), evitando re-hashes en updates parciales. Adicionalmente, el método `toJSON()` del modelo elimina `contrasena` de cualquier respuesta serializada.

**Consecuencias.**
- ✅ Imposible crear o actualizar un usuario sin que la contraseña se hashee.
- ✅ Las respuestas HTTP nunca devuelven el hash al cliente.
- ⚠️ Para verificar contraseña hay que llamar `usuario.verificarContrasena(plain)` — no comparar campos directamente.

---

## D-004 · CRUD genérico vía factory en lugar de un controlador por entidad

**Fecha:** 2026-05-02
**Estado:** Aceptada

**Contexto.** Las 12 entidades del esquema requieren las mismas 5 operaciones REST (list, get, create, update, delete). Crear 12 controladores casi idénticos genera ~600 líneas redundantes y dificulta cambios transversales (paginación, validación, logging).

**Decisión.** Se implementa un **factory** `buildCrudRouter(Model, { include })` en `src/utils/crudFactory.js` que devuelve un `Router` Express completo. Las rutas en `src/routes/index.js` consumen el factory y declaran qué relaciones se incluyen (`include`) por entidad. Cuando una entidad necesite reglas específicas (p. ej. autenticación o autorización por rol), se reemplaza la línea `router.use('/foo', buildCrudRouter(Foo))` por un router dedicado sin tocar el resto.

**Consecuencias.**
- ✅ Toda la capa CRUD cabe en un archivo de ~70 líneas en lugar de 12 archivos.
- ✅ Mejorar el manejo de errores o validación se hace en un solo lugar.
- ⚠️ La lógica especializada (autenticar al estudiante en `/progresos`, cálculo de `tiempo_empleado` en `/historiales`) tendrá que reemplazar el router genérico cuando llegue su semana.

---

## D-005 · Capa de servicios + clases de error para las reglas de negocio

**Fecha:** 2026-05-16
**Estado:** Aceptada

**Contexto.** Las semanas 5-6 exigen reglas de negocio que el CRUD genérico no cubre. El diseño ya las define: la transición de estado de `PROGRESO_ESTUDIANTE` (E14-DE02) y la regla clave de `USUARIO` de que el historial académico nunca se borra (E14-DE03). Meter esa lógica dentro del `crudFactory` lo contaminaría y rompería su carácter genérico.

**Decisión.** Se crea una **capa de servicios** (`src/services/`) con un módulo por regla y un conjunto de **clases de error** (`src/errors/AppError.js`: `NotFoundError` 404, `ConflictError` 409, `BusinessRuleError` 422). El `errorHandler` traduce cualquier `AppError` a su `statusCode`. Las rutas de negocio se montan **antes** del router CRUD genérico para tener prioridad de match.

**Artefacto de diseño que respalda la decisión.** E12 (Diagrama de Clases — métodos `completar()` / `desactivar()`), E13 (Secuencia) y E14 (Diagrama de Estados — DE-02 y DE-03).

**Consecuencias.**
- ✅ El CRUD genérico queda intacto; la lógica de negocio vive aislada y es testeable.
- ✅ Los status HTTP son semánticos (409 para transición inválida, 422 para regla violada) en vez de `throw new Error` genérico.
- ⚠️ Cada nueva regla obliga a un módulo de servicio y su ruta dedicada montada antes del genérico; hay que cuidar el orden de declaración en `routes/index.js`.

---

## D-006 · Columna `estado` en USUARIO para soft-delete (fidelidad a E14-DE03)

**Fecha:** 2026-05-16
**Estado:** Aceptada

**Contexto.** La Regla 2 bloqueaba el borrado de un usuario con historial (409). El diagrama de estados E14-DE03 modela en realidad una **desactivación lógica** (`activo → inactivo`) que conserva el historial, pero la tabla `USUARIO` del DDL no tenía columna de estado para representarlo.

**Decisión.** Se añade la columna `estado VARCHAR(20)` a `USUARIO` (DDL E11 y modelo Sequelize) con `CHECK`/`isIn` sobre los 5 estados de E14-DE03 (`pendiente`, `activo`, `bloqueado_temporal`, `inactivo`, `eliminado_logico`) y `DEFAULT 'activo'`. `DELETE /usuarios/:id` deja de borrar físicamente y hace soft-delete (`estado = 'inactivo'`), devolviendo `200` con el usuario actualizado.

**Artefacto de diseño que respalda la decisión.** E14-DE03 (Diagrama de Estados — USUARIO) y E12 `Usuario.desactivar()`.

**Consecuencias.**
- ✅ El backend refleja fielmente el ciclo de vida del usuario y el historial nunca se borra.
- ✅ La columna deja preparado el resto del ciclo (bloqueo temporal, eliminado lógico) para futuras reglas.
- ⚠️ Simplificación asumida: el registro crea el usuario directamente como `'activo'` (no `'pendiente'`); el flujo `registrar() → activar()` no se implementa en este parcial.
- ✅ El listado `GET /usuarios` filtra por `estado` (oculta `inactivo`/`eliminado_logico`) vía la opción `listWhere` del `crudFactory`; `GET /usuarios/:id` sí permite consultar un inactivo (acceso administrativo).

---

## D-007 · Incorporar PREGUNTA y OPCION_RESPUESTA (cierre del CU-001)

**Fecha:** 2026-06-05
**Estado:** Aceptada

**Contexto.** Durante la revisión, la docente detectó una incoherencia entre el diseño y el modelo de datos: CU-001 (paso 5 y flujo A2) habla de que el estudiante "envía una respuesta a una **pregunta**" y puede "reintentar máximo 3 veces **por pregunta**", y RF-016 plantea retroalimentación por pregunta; además el wireframe (E16) dibuja opciones de respuesta. Sin embargo, el MER (E8) modelaba `ACTIVIDAD` como un bloque monolítico con `criterio_evaluacion` en **texto libre**, sin entidad donde vivieran las preguntas ni sus opciones, lo que impedía la evaluación automática (CU-001 paso 6).

**Decisión.** Se añaden dos entidades al modelo:
- `PREGUNTA` (N:1 con `ACTIVIDAD`, `ON DELETE CASCADE`) con `enunciado`, `orden`, `puntaje`, `max_intentos` (materializa los reintentos de CU-001 A2) y `retroalimentacion`.
- `OPCION_RESPUESTA` (N:1 con `PREGUNTA`, `ON DELETE CASCADE`) con `texto`, `es_correcta` y `orden`. La marca `es_correcta` reemplaza al criterio en texto libre y habilita la evaluación automática (RF-012, CU-001 paso 6).

Se reflejan en DDL (E11), modelos Sequelize (`Pregunta`, `OpcionRespuesta`) con asociaciones aliased (`as: 'preguntas'`, `as: 'opciones'`), CRUD genérico (`/preguntas`, `/opciones`) y un endpoint de lectura anidada `GET /actividades/:id/preguntas`. El frontend del estudiante consume ese endpoint y conserva un banco local como respaldo para actividades aún sin preguntas.

**Artefacto de diseño que respalda la decisión.** CU-001 (pasos 5-6, flujo A2), RF-012, RF-016, E16-Wireframes y la observación de revisión de la docente. Actualiza E7 (diccionario), E8 (MER) y E9-E10 (relacional).

**Consecuencias.**
- ✅ El caso de uso central (CU-001) queda coherente: hay dónde viven las preguntas y la evaluación es automática.
- ✅ El docente puede crear preguntas y opciones reales desde el panel; el estudiante las responde de verdad.
- ✅ `criterio_evaluacion` pasa de texto libre a opciones marcadas como correctas (RF-012 evaluable).
- ⚠️ Pendiente para una versión posterior: una entidad puente `RESPUESTA_ESTUDIANTE` que registre qué opción eligió el estudiante y en qué intento (hoy el conteo de intentos no se persiste por estudiante).
- ✅ La tabla `NOTIFICACION` sugerida (SCR-13 · DE-01) **sí se implementó** (DDL E11, modelo, ruta `/notificaciones`): se generan avisos al asignar una actividad (desde el constructor del docente) y al completar un módulo. Con esto quedan incorporadas las 3 tablas que sugirió la docente.

---

## D-008 · Cierre de defectos y brechas detectados en la ejecución de pruebas

**Fecha:** 2026-11-23
**Estado:** Aceptada

**Contexto.** La ejecución de la colección Thunder y de pruebas adicionales (documento, sección 13) detectó tres defectos (BUG-01 a BUG-03) y dos brechas (GAP-01, GAP-02), y la matriz de calidad ISO/IEC 25010 (sección 14) marcó RNF-005, RNF-011 y RNF-013 como "No cumple".

**Decisión.**
- **BUG-03 / RNF-005:** `POST /api/auth/login` con `bcrypt.compare`, token JWT, bloqueo de 15 min tras 5 intentos fallidos (`USUARIO.estado = 'bloqueado_temporal'`, E14-DE03) y registro en `logs/seguridad.log`. Los contadores de intentos viven en memoria para no modificar el DDL; si el servidor se reinicia, el bloqueo se levanta. Pendiente: proteger las rutas con un middleware que verifique el token.
- **BUG-01:** `SequelizeUniqueConstraintError` se traduce a 409 (antes 400).
- **BUG-02:** la colección Thunder usa `tipo: "publica"` (el DDL solo admite `publica`/`privada`).
- **GAP-01:** `POST /api/progresos/:id/responder` evalúa en el servidor con `es_correcta` y calcula el puntaje (escalado a `puntaje_maximo`); el cliente ya no decide el puntaje.
- **GAP-02 / RNF-013:** `POST /api/reportes/generar` crea el PDF o Excel real y registra el REPORTE; al completar una actividad se crea la NOTIFICACION automática.
- **RNF-011:** pruebas de integración con Jest + Supertest (`npm test`), 28 casos, cobertura > 95 % de sentencias.

**Consecuencias.**
- ✅ Los cinco hallazgos quedan cubiertos por pruebas automatizadas.
- ⚠️ Las pruebas requieren la BD `ia_k12` creada con el DDL y usan correos únicos por ejecución (no limpian los datos).
- ⚠️ El frontend (`public/app.js`) aún envía el puntaje a `/completar`; migrarlo a `/responder` queda pendiente.
