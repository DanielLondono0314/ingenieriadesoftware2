# Registro de Solicitudes de Cambio (CRF) — IA K-12

Cada decisión de `repo/DECISIONES.md` se registra como una CRF con fecha, commit, RF/HU y estado. CRF-001 a CRF-007 se registraron **retroactivamente** el 2026-11-23 desde el historial de git (fecha y hash reales de cada commit). CRF-008 en adelante se registran al hacer el cambio.

| CRF | Cambio | Fecha | Commit | Estado |
|---|---|---|---|---|
| CRF-001 | D-001 Stack Node + Express + Sequelize | 2026-05-08 | 94e3faf | Cerrado |
| CRF-002 | D-002 Esquema creado por el DDL | 2026-05-08 | 94e3faf | Cerrado |
| CRF-003 | D-003 bcrypt en el modelo USUARIO (RNF-004) | 2026-05-08 | 94e3faf | Cerrado |
| CRF-004 | D-004 CRUD genérico (factory) | 2026-05-08 | 94e3faf | Reemplazado por CRF-011 |
| CRF-005 | D-005 Servicios y errores de negocio (RF-017, 020) | 2026-06-04 | aaba331 | Cerrado |
| CRF-006 | D-006 usuario.estado (RF-004) | 2026-06-04 | aaba331 | Cerrado |
| CRF-007 | D-007 PREGUNTA, OPCION_RESPUESTA, NOTIFICACION (RF-012, 016, 018) | 2026-06-05 | 4d61319 | Cerrado; documentos en CRF-014 |
| CRF-008 | BUG-01 correo duplicado → 409 (RF-001) | 2026-11-23 | e06c865 | Cerrado |
| CRF-009 | GAP-01 evaluación en el servidor (RF-016, 018) | 2026-11-23 | e06c865 | Cerrado |
| CRF-010 | GAP-02 reportes y notificación automática (RF-022, 023) | 2026-11-23 | e06c865 | Cerrado |
| CRF-011 | MVC: controladores y rutas sin modelos | 2026-11-23 | 67effac | Cerrado |
| CRF-012 | Login JWT y bloqueo (RF-005, RNF-004, RNF-005) | 2026-11-23 | 2218eba | Cerrado |
| CRF-013 | Autenticación y roles en todas las rutas; pantalla SCR-01 | 2026-11-23 | af052f5 | Cerrado |
| CRF-014 | E7, E9, E10 y E12 a 15 entidades (cierre de D-007) | 2026-11-23 | commit de documentación | Abierto: E7 entregado; E9, E10 y E12 por actualizar |
| CRF-015 | Pruebas Jest + Supertest (RNF-011) | 2026-11-23 | 8902ba5 | Cerrado |
| CRF-016 | RF-021: eliminar historial solo administrador | 2026-11-23 | aed1166 | Cerrado |
| CRF-017 | Desvío RF-007/009/010: el docente gestiona módulos | 2026-11-23 | — | Abierto: decidir restringir o enmendar HU-016 |

## Procedimiento
1. Abrir la CRF (fila nueva) con motivo, ECS afectados y RF/HU.
2. Implementar en un commit cuyo mensaje **empiece por los RF/HU** (`RF-005, RNF-005: …`).
3. Completar la columna *Commit* con el hash y cerrar la CRF.
4. Si toca un ECS de una línea base, anotarlo en `LINEA-BASE-1.md`.

> Los hashes de CRF-008 a CRF-016 corresponden a la serie de parches original; si se reaplicó con `git am`, reemplazarlos por los de `git log --oneline` (cada subject empieza por sus RF).
