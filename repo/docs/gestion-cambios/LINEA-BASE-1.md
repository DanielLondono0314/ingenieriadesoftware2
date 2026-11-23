# Línea Base 1 (LB1) — Diseño aprobado + primera construcción

**Etiqueta git:** `LB1` (anotada) sobre el commit `4d61319`
**Commit congelado:** `4d61319` — 2026-06-05 — «Hola soy daniel e hice el frontend jeje»
**Fecha de congelación:** 2026-06-05 (fecha del commit); declarada el 2026-11-23.

```
git tag -a LB1 4d61319 -m "Línea Base 1: DDL E11 (15 tablas), E7, E12, wireframes E16 y código al 2026-06-05"
git push origin LB1
```

## Elementos de configuración (ECS)
| ID | Elemento | Ubicación | Línea base |
|---|---|---|---|
| ECS-01 | Script DDL (E11) | docs/diseño/fase2-datos/E11-script-DDL.sql | LB1 |
| ECS-02 | Diccionario de datos (E7) | docs/diseño/fase2-datos/E7-diccionario-datos.md | LB1 (desactualizado; CRF-014) |
| ECS-03 | Modelo relacional y 3FN (E9, E10) | docs/diseño/fase2-datos/ | LB1 (desactualizado; CRF-014) |
| ECS-04 | Diagrama de clases (E12) | docs/diseño/fase3-componentes/E12-diagrama-clases.md | LB1 (desactualizado; CRF-014) |
| ECS-05 | Secuencia y estados (E13, E14) | docs/diseño/fase3-componentes/ | LB1 |
| ECS-06 | Mapa de navegación y wireframes (E15, E16, E17) | docs/diseño/fase4-interfaz/ | LB1 |
| ECS-07 | Código del backend | repo/src/ (models, controllers, services, routes, middleware) | LB1 + CRF-008 a CRF-016 |
| ECS-08 | Interfaz web | repo/public/ | LB1 + CRF-013 |
| ECS-09 | Pruebas automatizadas y colección | repo/tests/, docs/pruebas/ | CRF-015 |
| ECS-10 | Decisiones, CRF y línea base | repo/DECISIONES.md, docs/gestion-cambios/ | Vivo |
| ECS-11 | Informe del trabajo | IA_K12_COMPLETO_FINAL_actualizado.docx | Vivo |

## Estado de los artefactos en LB1
- DDL E11: 15 tablas (incluye PREGUNTA, OPCION_RESPUESTA, NOTIFICACION y `USUARIO.estado`).
- Diccionario E7, modelo relacional E9/E10 y diagrama de clases E12: describen 12 entidades (desactualizados respecto al DDL; ver CRF-014).
- Wireframes E16: 6 pantallas (SCR-01, 04, 08, 10, 17, 27).
- Código: CRUD genérico sin autenticación.

## Regla
Después de LB1 todo cambio a un ECS exige una CRF (`CRF.md`) y un commit cuyo mensaje empiece por los RF/HU. Cambios posteriores: CRF-008 a CRF-017.
