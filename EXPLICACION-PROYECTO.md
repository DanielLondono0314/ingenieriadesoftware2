# 🎓 Plataforma de Alfabetización en IA para K-12 — Explicación del Proyecto

> Documento de referencia generado a partir del análisis del código y de la base de datos en vivo.
> Stack real implementado: **Node.js + Express + Sequelize + PostgreSQL**.

---

## 1. ¿Para qué sirve?

Es una **plataforma educativa** que enseña conceptos de **Inteligencia Artificial a estudiantes de K-12** (kínder a grado 12). La idea de negocio:

- **Estudiantes** exploran módulos temáticos de IA, hacen actividades interactivas y reciben retroalimentación.
- **Docentes** crean módulos/actividades y siguen el avance de su grupo.
- **Administradores/Coordinadores** gestionan instituciones, usuarios y reportes.

> ⚠️ **Alcance:** lo que hay en este repo es el **"Trabajo Parcial 1"** — un trabajo académico de Ingeniería de Software. Cubre el **análisis, el diseño y el backend (API + base de datos)** del módulo **"Contenido Educativo y Seguimiento del Aprendizaje"**. El stack ideal contempla React + S3, pero **eso aún no está implementado** (por eso no hay frontend).

---

## 2. ¿Cómo funciona? (arquitectura)

Es una **API REST en capas**, todo en Node.js:

```
Cliente HTTP (curl / Thunder Client / futuro React)
        │
        ▼
┌─────────────────────────────────────────────┐
│  server.js        → arranca Express, CORS,    │
│                     logging (morgan), health  │
├─────────────────────────────────────────────┤
│  routes/index.js  → mapea URLs → recursos     │
├─────────────────────────────────────────────┤
│  utils/crudFactory.js → CRUD genérico         │
│  services/*.js        → reglas de negocio     │
├─────────────────────────────────────────────┤
│  models/*.js  → 12 modelos Sequelize (ORM)    │
│  + asociaciones (FKs con alias)               │
├─────────────────────────────────────────────┤
│  middleware/errorHandler.js → traduce errores │
│  errors/AppError.js → 404 / 409 / 422         │
└─────────────────────────────────────────────┘
        │
        ▼
   PostgreSQL 16 (12 tablas, en Docker)
```

**Decisiones técnicas clave** (`DECISIONES.md`):
- **Sequelize** (no Prisma ni TypeORM) porque mapea fácil a las tablas que ya creó el DDL y permite **alias en las asociaciones** (`docente`, `estudiante`, `autor`) — necesario porque varias tablas apuntan a `USUARIO` con FKs distintas.
- `timestamps: false` y `freezeTableName: true`: el esquema lo manda el SQL, no el ORM.

### El truco del "CRUD genérico"
En vez de escribir 5 endpoints × 12 entidades a mano, `crudFactory.js` genera automáticamente `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` para cualquier modelo. Las rutas solo le pasan el modelo y qué relaciones incluir.

---

## 3. El modelo de datos (12 tablas)

| Tipo | Tablas |
|---|---|
| **Maestras** (catálogos) | `ROL`, `NIVEL_EDUCATIVO`, `TIPO_CONTENIDO`, `TIPO_ACTIVIDAD`, `INSTITUCION` |
| **Transaccionales** | `USUARIO`, `MATRICULA`, `MODULO`, `ACTIVIDAD`, `PROGRESO_ESTUDIANTE`, `HISTORIAL_PRACTICA`, `REPORTE` |

**Relaciones principales:**
- Un `USUARIO` tiene un `ROL` y un `NIVEL_EDUCATIVO`.
- `MATRICULA` vincula `USUARIO ↔ INSTITUCION`.
- Un `MODULO` lo dicta un docente (`USUARIO`), tiene un `TIPO_CONTENIDO` y un `NIVEL`.
- Una `ACTIVIDAD` pertenece a un `MODULO` y tiene un `TIPO_ACTIVIDAD`.
- `PROGRESO_ESTUDIANTE` registra cómo va un estudiante en una actividad (único por estudiante+actividad).
- `HISTORIAL_PRACTICA` y `REPORTE` cierran el seguimiento.

El DDL ya viene con **datos semilla**: 5 roles, 4 niveles (K-2, 3-5, 6-8, 9-12), 4 tipos de contenido y 4 tipos de actividad.

---

## 4. Endpoints

### Sistema
| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/` | Info del API |
| `GET` | `/api/health` | Verifica conexión a la BD → `{"status":"ok","db":"connected"}` |

### CRUD (cada recurso expone los 5 verbos)
`GET /` · `GET /:id` · `POST /` · `PUT /:id` · `DELETE /:id`

| Recurso | Ruta |
|---|---|
| Roles | `/api/roles` |
| Niveles educativos | `/api/niveles-educativos` |
| Tipos de contenido | `/api/tipos-contenido` |
| Tipos de actividad | `/api/tipos-actividad` |
| Instituciones | `/api/instituciones` |
| Usuarios | `/api/usuarios` |
| Matrículas | `/api/matriculas` |
| Módulos | `/api/modulos` |
| Actividades | `/api/actividades` |
| Progreso de estudiantes | `/api/progresos` |
| Historial de práctica | `/api/historiales` |
| Reportes | `/api/reportes` |

### Reglas de negocio (lo más interesante — no es CRUD plano)

**① Completar una actividad** — `POST /api/progresos/:id/completar`
- Valida la transición `en_progreso → completado`.
- Si ya estaba completado → **409** (no se puede re-completar).
- Si el puntaje supera el `puntaje_maximo` de la actividad → **422**.

**② Desactivación lógica de usuario (soft-delete)** — `DELETE /api/usuarios/:id`
- En vez de borrar, pasa `estado` de `activo → inactivo`.
- **Conserva el historial académico** ("el historial NUNCA se borra").
- Si ya estaba inactivo → **409**.
- Además, el listado `GET /api/usuarios` **oculta** los inactivos.

### Manejo de errores (semántico)
`errorHandler.js` traduce automáticamente:
- `404` recurso no encontrado · `409` conflicto de estado · `422` regla de negocio · `400` validación Sequelize · `500` error interno.

---

## 5. Pruebas

> ⚠️ **No hay tests automatizados** (no usa Jest/Mocha). Las pruebas son **manuales sobre la API**.

Mediante una **colección de Thunder Client** (`docs/pruebas/thunder-collection-IA-K12.json`): 4 carpetas, 22 requests, que se ejecutan en orden con la BD recién migrada:

| Carpeta | Qué prueba |
|---|---|
| 1. Lecturas | health + datos semilla |
| 2. Crear datos base | usuarios, institución, módulo, actividad, progreso |
| 3. Regla 1 (Completar) | secuencia `422 → 200 → 409` |
| 4. Regla 2 (Soft-delete) | desactivación + filtro + historial conservado |

Para usarla: VS Code → Thunder Client → Import → ese JSON. Base URL `http://localhost:3000`.

También hay un **`docs/pruebas/GUION-EXPOSICION.md`** (guion para sustentar el trabajo) y abundante documentación de diseño en `docs/` (análisis, arquitectura E1-E17, trazabilidad M1-M13, diagramas).

---

## 6. Cómo correrlo en local

Requisitos: Node.js ≥ 18 y PostgreSQL (aquí montado en Docker vía Colima).

```bash
# 1. Levantar Postgres (Docker)
colima start                 # si Docker no responde
docker start ia_k12_pg       # contenedor postgres:16, BD ia_k12

# 2. Backend
cd repo
npm install                  # solo la primera vez
cp .env.example .env         # solo la primera vez
npm run dev                  # o: npm start
```

API en `http://localhost:3000` (endpoints bajo `/api`). Health: `GET /api/health`.

**Migración / recrear esquema:**
```bash
docker exec -i ia_k12_pg psql -U postgres -d ia_k12 < repo/docs/diseño/fase2-datos/E11-script-DDL.sql
```

**Detener:**
```bash
kill $(lsof -ti:3000)         # parar el backend
docker stop ia_k12_pg         # parar Postgres
```

---

## 7. Estructura del repositorio

```
repo/
├── src/
│   ├── config/database.js        # Conexión Sequelize → PostgreSQL
│   ├── models/                   # 12 modelos ORM + index.js (asociaciones)
│   ├── routes/index.js           # CRUD REST de las 12 entidades + reglas de negocio
│   ├── services/                 # progresoService.js, usuarioService.js
│   ├── middleware/errorHandler.js
│   ├── errors/AppError.js        # NotFoundError / ConflictError / BusinessRuleError
│   ├── utils/crudFactory.js      # CRUD genérico reutilizable
│   └── server.js                 # Entry point del API
├── docs/
│   ├── analisis/                 # Secciones 1-7 del trabajo
│   ├── diseño/                   # E1-E17 (arquitectura, datos, componentes, interfaz)
│   ├── pruebas/                  # Thunder Client + guion de exposición
│   └── trazabilidad/             # Matrices M1-M13
├── package.json
├── .env.example
├── DECISIONES.md                 # Bitácora de decisiones técnicas
├── README.md
└── BITACORA.md
```

---

## 8. El trabajo en números

| Artefacto | Cantidad |
|-----------|----------|
| Historias de Usuario | 18 (HU-001 a HU-018) |
| Requisitos Funcionales | 23 (RF-001 a RF-023) |
| Requisitos No Funcionales | 15 (RNF-001 a RNF-015) |
| Casos de Uso | 5 (CU-001 a CU-005) |
| Entidades MER (3FN) | 12 |
| Clases UML | 12 |
| Diagramas PNG | 14 (Figuras 0-14) |
| Pantallas de UI (diseñadas, no implementadas) | 35 (SCR-01 a SCR-35) |
| Matrices de Trazabilidad | 13 (M1-M13) |
| Entregables Fase Diseño | 17 (E1-E17) |
