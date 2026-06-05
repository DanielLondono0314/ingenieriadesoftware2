# Pruebas de API — Thunder Client

Colección importable con todos los casos de prueba del backend (CRUD + las 2 reglas de negocio).

## Archivo

- `thunder-collection-IA-K12.json` — colección de Thunder Client (4 carpetas, 22 requests).

## Cómo importarla

1. Abre **Thunder Client** en VS Code (icono del rayo en la barra lateral).
2. Pestaña **Collections** → botón menú `⋯` → **Import**.
3. Selecciona `docs/pruebas/thunder-collection-IA-K12.json`.

## Cómo usarla

1. Levanta el backend: `npm run dev` (requiere PostgreSQL con la BD `ia_k12` creada desde el DDL).
2. Ejecuta los requests **en orden de carpeta** (1 → 2 → 3 → 4). Con la BD recién creada
   desde el DDL, los IDs salen como indican los nombres (estudiante = 1, docente = 2, etc.).

## Carpetas

| Carpeta | Qué prueba |
|---|---|
| 1. Lecturas | `health` y maestras con seeds |
| 2. Crear datos base | usuarios, institución, módulo, actividad, progreso |
| 3. Regla 1 — Completar (E14-DE02) | transición de progreso: `422` / `200` / `409` |
| 4. Regla 2 — Soft-delete (E14-DE03) | desactivación lógica, filtro de inactivos y conservación del historial |

> Base URL fija en la colección: `http://localhost:3000`. Si cambias el puerto, ajústalo en cada request.
