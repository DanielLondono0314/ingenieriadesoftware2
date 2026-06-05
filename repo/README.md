# Plataforma de Alfabetización en IA para K-12

**Asignatura:** Ingeniería de Software — Programación con Framework  
**Estudiante:** Daniel Londoño  
**Repositorio:** `proyecto-DanielLondono/`

---

## Descripción del Sistema

Plataforma web educativa que enseña conceptos de **Inteligencia Artificial a estudiantes K-12** (kínder a grado 12). Los estudiantes exploran módulos temáticos, realizan actividades interactivas y reciben retroalimentación inmediata. Los docentes crean y asignan actividades. Los administradores gestionan todo el sistema.

**Stack técnico:** React + Node.js + PostgreSQL 15 + S3

---

## Documentación Obligatoria — Respuestas

**¿Qué módulo implementas?**
El módulo de **Contenido Educativo y Seguimiento del Aprendizaje**: gestión de módulos
temáticos de IA, actividades interactivas, el progreso de cada estudiante sobre esas
actividades y el historial de práctica por módulo, sobre la base de usuarios/roles e
instituciones.

**¿Qué tablas cubre tu módulo?**
Las 12 entidades del modelo 3FN (E9-E11):
- *Maestras:* `ROL`, `NIVEL_EDUCATIVO`, `TIPO_CONTENIDO`, `TIPO_ACTIVIDAD`, `INSTITUCION`.
- *Transaccionales:* `USUARIO`, `MATRICULA`, `MODULO`, `ACTIVIDAD`, `PROGRESO_ESTUDIANTE`,
  `HISTORIAL_PRACTICA`, `REPORTE`.

**¿Qué framework elegiste y por qué?**
**Node.js 18 + Express 4 + Sequelize 6** sobre PostgreSQL 15. Se eligió porque Sequelize
permite mapear los modelos a las tablas ya creadas por el DDL (E11) y declarar las
asociaciones con alias (`docente`, `estudiante`, `autor`) que reflejan los FK duplicados
hacia `USUARIO`. Se descartó Prisma (su migración inicial exigía ajustes manuales en cada
FK con alias) y TypeORM (curva más alta para los plazos). Detalle completo en
[DECISIONES.md](DECISIONES.md) (D-001).

**¿Cómo ejecutar el proyecto?**
Ver la sección [Cómo correr el backend](#cómo-correr-el-backend) más abajo.

**¿Cuál es el repositorio de tu compañero?**
El trabajo se desarrolla en un **repositorio compartido** con el compañero Daniel Londoño:
`https://github.com/DanielLondono0314/ingenieriadesoftware2`

---

## Estructura del Repositorio

```
proyecto-DanielLondono/
├── src/                          # Backend Node.js + Express + Sequelize
│   ├── config/database.js        # Conexión Sequelize → PostgreSQL
│   ├── models/                   # 12 modelos ORM con asociaciones
│   ├── routes/index.js           # CRUD REST de las 12 entidades
│   ├── middleware/errorHandler.js
│   ├── utils/crudFactory.js      # CRUD genérico reutilizable
│   └── server.js                 # Entry point del API
├── docs/
│   ├── analisis/                 # Secciones 1-7 del trabajo
│   ├── diseño/
│   │   ├── fase1-arquitectura/   # E1-E6
│   │   ├── fase2-datos/          # E7-E11 + script DDL .sql
│   │   ├── fase3-componentes/    # E12-E14
│   │   ├── fase4-interfaz/       # E15-E17
│   │   └── imagenes/             # 14 diagramas PNG
│   └── trazabilidad/             # Sección 9 — 13 matrices (M1-M13)
├── package.json
├── .env.example
├── DECISIONES.md                 # Bitácora de decisiones técnicas
├── README.md
└── BITACORA.md
```

---

## Cómo correr el backend

Requisitos: Node.js ≥ 18 y PostgreSQL 15.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables (copia .env.example → .env y ajusta credenciales)
cp .env.example .env

# 3. Crear la base de datos y aplicar el DDL
createdb ia_k12
psql -d ia_k12 -f docs/diseño/fase2-datos/E11-script-DDL.sql

# 4. Levantar el servidor
npm run dev          # con nodemon
# ó
npm start
```

API disponible en `http://localhost:3000/api`. Health check: `GET /api/health`.

### Endpoints CRUD disponibles

| Recurso | Tipo | Ruta |
|---|---|---|
| Roles | maestra | `/api/roles` |
| Niveles educativos | maestra | `/api/niveles-educativos` |
| Tipos de contenido | maestra | `/api/tipos-contenido` |
| Tipos de actividad | maestra | `/api/tipos-actividad` |
| Instituciones | maestra | `/api/instituciones` |
| Usuarios | transaccional | `/api/usuarios` |
| Matrículas | transaccional | `/api/matriculas` |
| Módulos | transaccional | `/api/modulos` |
| Actividades | transaccional | `/api/actividades` |
| Progreso de estudiantes | transaccional | `/api/progresos` |
| Historial de práctica | transaccional | `/api/historiales` |
| Reportes | transaccional | `/api/reportes` |

Cada recurso expone `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

### Reglas de negocio implementadas

Además del CRUD, hay endpoints con lógica de negocio (capa `src/services/`):

| Endpoint | Regla | Respaldo de diseño |
|---|---|---|
| `POST /api/progresos/:id/completar` | Completar una actividad: valida la transición `en_progreso → completado`, impide re-completar (`409`) y verifica que el puntaje no supere el `puntaje_maximo` (`422`). | E12 `ProgresoEstudiante.completar()` · E14-DE02 |
| `DELETE /api/usuarios/:id` | Desactivación lógica (soft-delete): pasa `estado` de `activo → inactivo` sin borrar físicamente, conservando el historial académico. `409` si ya está inactivo. | E12 `Usuario.desactivar()` · E14-DE03 ("el historial NUNCA se borra") |

---

## El Trabajo en Números

| Artefacto | Cantidad |
|-----------|----------|
| Historias de Usuario | 18 (HU-001 a HU-018) |
| Requisitos Funcionales | 23 (RF-001 a RF-023) |
| Requisitos No Funcionales | 15 (RNF-001 a RNF-015) |
| Casos de Uso | 5 (CU-001 a CU-005) |
| Entidades MER (3FN) | 12 |
| Clases UML | 12 |
| Diagramas PNG | 14 (Figuras 0-14) |
| Pantallas de UI | 35 (SCR-01 a SCR-35) |
| Matrices de Trazabilidad | 13 (M1-M13) |
| Entregables Fase Diseño | 17 (E1-E17) |

---

## Navegación Rápida

| Sección | Archivo |
|---------|---------|
| 1. Planteamiento | [01-planteamiento-problema.md](docs/analisis/01-planteamiento-problema.md) |
| 2. Espina de pescado | [02-espina-de-pescado.md](docs/analisis/02-espina-de-pescado.md) |
| 3. Alcance | [03-alcance.md](docs/analisis/03-alcance.md) |
| 4. Objetivo general | [04-objetivo-general.md](docs/analisis/04-objetivo-general.md) |
| 5. Objetivos específicos | [05-objetivos-especificos.md](docs/analisis/05-objetivos-especificos.md) |
| 6. Técnicas de elicitación | [06-tecnicas-elicitacion.md](docs/analisis/06-tecnicas-elicitacion.md) |
| 7. Casos de uso | [07-casos-de-uso.md](docs/analisis/07-casos-de-uso.md) |
| 8.1 Arquitectura (E1-E6) | [fase1-arquitectura/](docs/diseño/fase1-arquitectura/) |
| 8.2 Datos (E7-E11) | [fase2-datos/](docs/diseño/fase2-datos/) |
| 8.3 Componentes (E12-E14) | [fase3-componentes/](docs/diseño/fase3-componentes/) |
| 8.4 Interfaz (E15-E17) | [fase4-interfaz/](docs/diseño/fase4-interfaz/) |
| 9. Trazabilidad (M1-M13) | [trazabilidad/](docs/trazabilidad/) |
