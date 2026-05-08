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

---

## Correcciones Aplicadas

| Fecha | Corrección | Archivo Afectado |
|-------|-----------|-----------------|
| 2025-04-14 | Eliminar tiempo_empleado del esquema (3FN) | E10-normalizacion-3FN.md · E11-script-DDL.sql |
| 2025-04-14 | Eliminar modulos_completados del esquema (3FN) | E10-normalizacion-3FN.md · E11-script-DDL.sql |
| 2025-04-14 | Crear tabla NIVEL_EDUCATIVO (1FN) | E9-modelo-relacional.md · E11-script-DDL.sql |
| 2025-04-21 | Añadir campo codigo_nie a NIVEL_EDUCATIVO | E7-diccionario-datos.md · E9-modelo-relacional.md |
