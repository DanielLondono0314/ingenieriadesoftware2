# 📘 Explicación 2.0 — Cómo el proyecto cumple lo que pide la docente

> Documento de referencia para la **entrega final (Trabajo Parcial 1 — Programación con Framework)**.
> Explica, punto por punto, cómo el backend implementado responde a cada requisito de la guía de la docente,
> dónde vive cada cosa en el código, y analiza la sugerencia de las tablas faltantes (PREGUNTA, OPCION_RESPUESTA, NOTIFICACION).
>
> Complementa a [`EXPLICACION-PROYECTO.md`](EXPLICACION-PROYECTO.md) (que describe *qué es* el proyecto).
> Aquí el foco es: **¿cumple lo que la docente exige y cómo?**

---

## 0. Resumen ejecutivo (TL;DR)

- ✅ **Todos los artefactos de diseño** (E1–E17), las **13 matrices de trazabilidad** (M1–M13) y los **3 documentos obligatorios** (README, BITACORA, DECISIONES) **están en el repositorio**.
- ✅ El **mapeo Diseño → Framework** que pide la docente se cumple: cada fase (1–4) tiene su correlato en el código.
- ✅ La **trazabilidad Diseño→Código** está visible: cada método lleva el comentario `// CU | RF | E12/E13/E14`.
- ✅ Las **2 reglas de negocio** exigidas (semanas 5–6) están implementadas en una capa de servicios.
- ⚠️ **No hay capa de presentación (frontend)**: la Fase 4 está *diseñada* (E15–E17) pero no *implementada*. El parcial se centró en backend + datos + lógica.
- 💡 **Sugerencia de la docente sobre tablas faltantes**: es **válida y bien fundamentada**. Sección 6 propone cómo incorporarlas. Se deja a criterio, pero se recomienda al menos `PREGUNTA` + `OPCION_RESPUESTA`.

---

## 1. El punto de partida: el diseño ya hecho

La docente indica que cada artefacto de diseño tiene un uso directo en esta etapa. Así se materializó cada uno:

| Artefacto de diseño | Para qué sirve | Dónde está implementado |
|---|---|---|
| **E5 — Componentes UML** | Estructura de carpetas | `src/config`, `src/models`, `src/routes`, `src/services`, `src/middleware`, `src/utils` |
| **E6 — Despliegue UML** | Configuración del entorno | `.env.example`, `src/config/database.js` |
| **E11 — Script DDL** | La base de datos | `docs/diseño/fase2-datos/E11-script-DDL.sql` (se ejecuta con `npm run db:migrate`) |
| **E9–E10 — Modelo Relacional** | Modelos ORM y relaciones | `src/models/*.js` + `src/models/index.js` (asociaciones) |
| **E12 — Diagrama de Clases** | Clases y métodos ya definidos | `src/services/progresoService.js` (`completar()`), `src/services/usuarioService.js` (`desactivar()`) |
| **E13 — Secuencia** | La receta de cada endpoint | `src/routes/index.js`, `src/utils/crudFactory.js` |
| **E15 — Mapa de Navegación** | Las rutas | Rutas API en `routes/index.js`. *(Rutas de UI: pendientes, sin frontend.)* |

---

## 2. Mapeo Diseño → Framework, fase por fase

### FASE 1 → Estructura del proyecto

| Artefacto | Lo que genera en el framework | Estado |
|---|---|---|
| E5 Componentes | Estructura de carpetas y módulos | ✅ `src/` con 6 subcarpetas por responsabilidad |
| E6 Despliegue | Configuración de entornos y variables | ✅ `.env` (PORT, DB_*, BCRYPT_SALT_ROUNDS) |
| E4 Arquetipos | Nombres de clases, modelos y servicios | ✅ `Usuario`, `Modulo`, `ProgresoEstudiante`, `progresoService`… |

**Entrega Semana 1** — *Framework inicializado y corriendo, estructura de carpetas basada en el Diagrama de Componentes, repositorio creado, README completo, primera entrada de bitácora.*
→ ✅ Cumplido. `server.js` levanta Express con `GET /api/health`; estructura `src/` deriva de E5; `BITACORA.md` Entrada #01.

---

### FASE 2 → Capa de datos

| Artefacto | Lo que genera en el framework | Estado |
|---|---|---|
| E11 DDL | Script ejecutado directamente | ✅ `npm run db:migrate` crea 12 tablas + índices + vista + seeds |
| E9–E10 Relacional | Modelos ORM con relaciones | ✅ 12 modelos + asociaciones con alias |
| E7 Diccionario de Datos | Validaciones y restricciones en los modelos | ✅ `validate: { isIn, isEmail }`, `allowNull`, `UNIQUE` |
| E8 MER | Relaciones entre modelos ORM | ✅ `hasMany`/`belongsTo` reflejan las 15 relaciones de E8 |

**Entrega Semana 2** — *BD creada desde el DDL, modelos creados, relaciones definidas en código, bitácora actualizada.*
→ ✅ Cumplido. `BITACORA.md` Entrada #02 documenta el problema de los dos FK hacia `USUARIO` y su solución con `as:` (alias).

**Cómo se ven las relaciones en el código** (`src/models/index.js`):
```js
// Dos FK distintas hacia USUARIO se distinguen con alias (E8 REL-08, REL-10):
Modulo.belongsTo(Usuario,  { foreignKey: 'id_docente',    as: 'docente'    });
ProgresoEstudiante.belongsTo(Usuario, { foreignKey: 'id_estudiante', as: 'estudiante' });
Reporte.belongsTo(Usuario, { foreignKey: 'id_generado_por', as: 'autor'    });
```

---

### FASE 3 → Lógica de negocio

| Artefacto | Lo que genera en el framework | Estado |
|---|---|---|
| E12 Clases | Clases, Services y Repositories | ✅ Capa `src/services/` + clases de error `AppError` |
| E13 Secuencia | Métodos de controladores y servicios | ✅ Cada ruta sigue la secuencia (validar → consultar → guardar → responder) |
| E14 Estados | Campos de estado en BD y lógica de transición | ✅ `estado` en PROGRESO y USUARIO con transiciones controladas |

**Entrega Semana 3** — *CRUD de tablas maestras + DECISIONES.md con ≥2 entradas.*
→ ✅ CRUD de las 5 maestras (ROL, NIVEL_EDUCATIVO, TIPO_CONTENIDO, TIPO_ACTIVIDAD, INSTITUCION) vía `buildCrudRouter`. `DECISIONES.md` tiene **6 entradas** (D-001 a D-006).

**Entrega Semana 4** — *Primeras transaccionales con FK y CRUD, relación con maestras en código.*
→ ✅ Las 7 transaccionales con `include` de sus maestras (p. ej. `/modulos` incluye TipoContenido, Nivel y docente).

**Entrega Semana 5** — *Segunda transaccional + relaciones entre todas las entidades + ≥1 regla de negocio.*
→ ✅ Regla 1 (`completar progreso`). `BITACORA.md` Entrada #05/#06 con reflexión.

**Regla de negocio #1 — Completar actividad** (`src/services/progresoService.js`):
```
POST /api/progresos/:id/completar
- Valida transición en_progreso → completado     (E14-DE02)
- 409 si ya estaba completado (no re-completar)
- 422 si puntaje > puntaje_maximo de la actividad
```

**Regla de negocio #2 — Soft-delete de usuario** (`src/services/usuarioService.js`):
```
DELETE /api/usuarios/:id
- estado activo → inactivo (NO borra físicamente)  (E14-DE03)
- conserva el historial académico ("nunca se borra")
- 409 si ya estaba inactivo
- GET /usuarios oculta inactivos (listWhere)
```

---

### FASE 4 → Capa de presentación

| Artefacto | Lo que genera en el framework | Estado |
|---|---|---|
| E15 Navegación | Definición de rutas | ⚠️ Rutas **API** sí (`/api/...`). Rutas de **vistas** no. |
| E16 Wireframes | Estructura de vistas/templates | ❌ No implementado (sin frontend) |
| E17 Prototipo | Guía visual para vistas finales | ❌ No implementado (sin frontend) |

**Entrega Semana 6** — *Todas las entidades con CRUD, ≥2 reglas de negocio, trazabilidad visible, bitácora al día.*
→ ✅ 12 entidades con CRUD, **2 reglas** implementadas, comentarios de trazabilidad en todos los métodos.

**Entrega Semana 7 (final)** — *Módulo completo y funcional, repo ordenado, README/BITACORA/DECISIONES completos, demostración funcional, reflexión final.*
→ ✅ Backend funcional y probado. ⚠️ La "demostración" es vía API (Thunder Client), no interfaz gráfica.

> **Nota honesta para la sustentación:** la Fase 4 está completamente *diseñada* (E15–E17 + 35 pantallas SCR), pero el alcance del parcial priorizó las Fases 1–3 (backend, datos, lógica). Si la rúbrica exige una capa de presentación funcional, ése es el gap a cubrir (ver `EXPLICACION-PROYECTO.md` → propuesta de frontend React).

---

## 3. Documentación obligatoria — verificación

### README.md — responde las 5 preguntas exigidas
- ✅ ¿Qué módulo implementas? → *Contenido Educativo y Seguimiento del Aprendizaje*.
- ✅ ¿Qué tablas cubre? → las 12 entidades (5 maestras + 7 transaccionales).
- ✅ ¿Qué framework y por qué? → Node + Express + Sequelize (justificación + descarte de Prisma/TypeORM).
- ✅ ¿Cómo ejecutar? → sección "Cómo correr el backend".
- ✅ ¿Repositorio del compañero? → enlace incluido.

### BITACORA.md — una entrada mínimo por semana, formato exigido
- ✅ 7 entradas con el formato obligatorio (¿Qué hice? / ¿Qué problema? / ¿Cómo lo resolví? / ¿Usé IA?).
- ✅ Tabla de avance semanal (semanas 1–5 de la fase de framework, todas ✅).
- ✅ Reflexión sobre dificultades (Entradas #05–#07).

### DECISIONES.md — formato exigido
- ✅ 6 decisiones (D-001 a D-006) con: ¿Qué decidí? / ¿Por qué? / ¿Qué artefacto respalda la decisión? / Consecuencias.

### Trazabilidad Diseño → Código
- ✅ Cada método lleva el comentario que lo vincula con el diseño. Ejemplo real del código:
```js
// CU-001 | RF-016,RF-018 | E12-ProgresoEstudiante.completar() · E14-DE02
router.post('/progresos/:id/completar', async (req, res, next) => { ... });
```

---

## 4. Inventario de artefactos en el repositorio (garantía)

| Carpeta | Contenido | Cantidad |
|---|---|---|
| `docs/analisis/` | Secciones 1–7 (problema, alcance, objetivos, elicitación, casos de uso) | 7 archivos |
| `docs/diseño/fase1-arquitectura/` | E1–E6 (contexto, interacciones, DCA, arquetipos, componentes, despliegue) | 6 archivos |
| `docs/diseño/fase2-datos/` | E7–E11 (diccionario, MER, relacional, 3FN, **DDL .sql**) | 5 archivos |
| `docs/diseño/fase3-componentes/` | E12–E14 (clases, secuencia, estados) | 3 archivos |
| `docs/diseño/fase4-interfaz/` | E15–E17 (navegación, wireframes, prototipo) | 3 archivos |
| `docs/diseño/imagenes/` | Diagramas PNG (Figuras 0–14) | 15 imágenes |
| `docs/trazabilidad/` | Matrices M1–M13 | 13 archivos |
| `docs/pruebas/` | Colección Thunder Client + guion de exposición | 3 archivos |
| Raíz | README, BITACORA, DECISIONES | 3 archivos |

**Conclusión:** el diseño completo está versionado en el repo y el código lo referencia. ✅

---

## 5. Cómo "funciona todo" — recorrido de una petición real

Ejemplo: un estudiante completa una actividad (`POST /api/progresos/7/completar`).

```
1. server.js          → Express recibe el POST, pasa por CORS + JSON + morgan
2. routes/index.js    → la ruta de negocio se montó ANTES del CRUD genérico → matchea
3. progresoService    → completarProgreso(7, puntaje):
      a) ProgresoEstudiante.findByPk(7, include: Actividad)   [E13: consultar]
      b) si no existe        → NotFoundError (404)
      c) si ya 'completado'  → ConflictError (409)            [E14-DE02]
      d) si puntaje > max    → BusinessRuleError (422)        [E12-Actividad.evaluar()]
      e) estado='completado', fecha=now, save()               [E13: guardar]
4. models/            → Sequelize traduce a UPDATE en PostgreSQL
5. errorHandler       → si hubo AppError, lo traduce al status correcto
6. respuesta JSON     → el progreso actualizado, o el error semántico
```

Esto es exactamente la **secuencia E13** materializada en código, con los **estados E14** y las **clases/métodos E12**.

---

## 6. 💡 Análisis de la sugerencia de la docente: tablas faltantes

La docente detectó **3 tablas que el MER (E8) no tiene pero que el resto del diseño implica**. Su observación es **correcta y bien fundamentada**. Análisis y propuesta:

### 6.1 `PREGUNTA` — **recomendada (alta prioridad)**

**Evidencia que la respalda:**
- CU-001 paso 5: *"El estudiante envía una respuesta a una pregunta o ejercicio"* → si hay respuesta, hay pregunta.
- CU-001 flujo A2: *"permite reintentar máximo 3 veces **por pregunta**"* → la pregunta es la unidad de reintento.
- RF-016: la retroalimentación es **por pregunta**, no por actividad completa.

**Problema actual:** `ACTIVIDAD` es un bloque monolítico; no hay dónde guardar cada pregunta ni contar reintentos por pregunta.

**Propuesta de esquema:**
```sql
CREATE TABLE PREGUNTA (
    id_pregunta      SERIAL PRIMARY KEY,
    id_actividad     INT NOT NULL REFERENCES ACTIVIDAD(id_actividad) ON DELETE CASCADE,
    enunciado        TEXT NOT NULL,
    orden            INT  NOT NULL,
    puntaje          DECIMAL(6,2) NOT NULL DEFAULT 1,
    max_intentos     INT  NOT NULL DEFAULT 3,     -- CU-001 A2
    retroalimentacion TEXT
);
```
**Relación:** `ACTIVIDAD 1—N PREGUNTA` (composición, igual que MÓDULO→ACTIVIDAD, REL-06).

---

### 6.2 `OPCION_RESPUESTA` — **recomendada (alta prioridad, junto con PREGUNTA)**

**Evidencia que la respalda:**
- El **wireframe (E16)** la dibuja, pero el MER no la tiene.
- RF-012: *"crear actividades con criterio de evaluación"* → hoy `criterio_evaluacion` es **texto libre (TEXT)**, cuando debería expresarse como **opciones marcadas como correctas** (evaluables automáticamente).

**Problema actual:** sin opciones marcadas, el "Motor de Retroalimentación" (CU-001 paso 6) no puede evaluar automáticamente; la corrección quedaría manual.

**Propuesta de esquema:**
```sql
CREATE TABLE OPCION_RESPUESTA (
    id_opcion    SERIAL PRIMARY KEY,
    id_pregunta  INT NOT NULL REFERENCES PREGUNTA(id_pregunta) ON DELETE CASCADE,
    texto        TEXT NOT NULL,
    es_correcta  BOOLEAN NOT NULL DEFAULT FALSE,   -- reemplaza el criterio en texto libre
    orden        INT NOT NULL
);
```
**Relación:** `PREGUNTA 1—N OPCION_RESPUESTA`. Habilita la evaluación automática de CU-001 paso 6 y formaliza RF-012.

> Con estas dos tablas, el `PROGRESO_ESTUDIANTE` podría enriquecerse con una tabla puente `RESPUESTA_ESTUDIANTE` (qué opción eligió, en qué intento), pero eso ya excede la sugerencia mínima.

---

### 6.3 `NOTIFICACION` — **opcional (prioridad media)**

**Evidencia que la respalda:**
- Pantallas/navegación: **SCR-13 Notificaciones** aparece en el mapa de navegación del panel del estudiante (E15).
- DE-01: el estado **ASIGNADA** de la actividad sugiere un evento que notifica al estudiante.

**Problema actual:** no existe entidad para almacenar avisos (actividad asignada, resultado disponible, etc.).

**Propuesta de esquema:**
```sql
CREATE TABLE NOTIFICACION (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario      INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    tipo            VARCHAR(40) NOT NULL,   -- 'actividad_asignada', 'resultado_listo'...
    mensaje         TEXT NOT NULL,
    leida           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW()
);
```
**Relación:** `USUARIO 1—N NOTIFICACION`.

---

### 6.4 Recomendación final (se deja a tu criterio, como dijo la docente)

| Tabla | Prioridad | Razón |
|---|---|---|
| `PREGUNTA` | 🔴 Alta | Sin ella, CU-001 (el caso de uso central) no es coherente. |
| `OPCION_RESPUESTA` | 🔴 Alta | Habilita evaluación automática y formaliza RF-012. Va de la mano con PREGUNTA. |
| `NOTIFICACION` | 🟡 Media | Mejora fidelidad con E15/DE-01, pero no es crítica para el flujo de aprendizaje. |

**Si se decide incorporarlas**, el impacto sería:
1. **E11 DDL** — añadir las 2–3 tablas (script arriba).
2. **`src/models/`** — crear `Pregunta.js`, `OpcionRespuesta.js`, (`Notificacion.js`) + asociaciones en `index.js`.
3. **`routes/index.js`** — registrar `buildCrudRouter` para cada una (CRUD inmediato).
4. **Documentación** — actualizar E8 (MER), E9–E10 (relacional), E7 (diccionario) y una nueva entrada en `DECISIONES.md` justificando el cambio (formato: ¿qué decidí? / ¿por qué? / ¿qué artefacto respalda?).
5. **Trazabilidad** — los comentarios `// CU-001 | RF-012,RF-016 | E12...` en los nuevos métodos.

> Esto convertiría una observación de la docente en una **mejora trazable de diseño→código**, justo lo que la rúbrica valora. Si quieres, puedo implementarlo (DDL + modelos + rutas + actualización de docs) en una rama aparte.

---

## 7. Checklist final de cumplimiento

| Requisito de la docente | Estado |
|---|---|
| Framework inicializado y corriendo localmente | ✅ |
| Estructura de carpetas basada en E5 (Componentes) | ✅ |
| BD creada desde el DDL (E11) | ✅ |
| Modelos ORM con relaciones (E9–E10) | ✅ |
| Validaciones desde el diccionario (E7) | ✅ |
| CRUD de tablas maestras | ✅ |
| CRUD de tablas transaccionales con FK | ✅ |
| ≥ 2 reglas de negocio | ✅ (2: completar progreso, soft-delete) |
| Trazabilidad Diseño→Código en comentarios | ✅ |
| README con las 5 preguntas | ✅ |
| BITACORA (1 entrada/semana, formato) | ✅ (7 entradas) |
| DECISIONES (formato) | ✅ (6 decisiones) |
| Capa de presentación funcional (Fase 4) | ⚠️ Diseñada, no implementada |
| Tablas PREGUNTA / OPCION_RESPUESTA / NOTIFICACION | ⏳ Sugeridas, a criterio (sección 6) |

**Veredicto:** el módulo cumple las Fases 1–3 de forma sólida y trazable. Los dos puntos abiertos son (a) la capa de presentación y (b) la decisión sobre las tablas sugeridas por la docente.
