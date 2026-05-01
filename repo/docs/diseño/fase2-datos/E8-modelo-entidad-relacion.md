# E8 · Modelo Entidad-Relación Conceptual (MER)

## Diagrama

> Los diagramas visuales están en `docs/diseño/imagenes/`

## Entidades Fuertes (9)

| Entidad | PK | Descripción |
|---------|-----|-------------|
| ROL | id_rol | Catálogo de roles del sistema |
| NIVEL_EDUCATIVO | id_nivel | Categorización de grados K-12 (3FN) |
| TIPO_CONTENIDO | id_tipo_contenido | Catálogo temático de módulos (3FN) |
| TIPO_ACTIVIDAD | id_tipo_actividad | Catálogo pedagógico de actividades (3FN) |
| INSTITUCIÓN | id_institucion | Entidad educativa externa |
| USUARIO | id_usuario | Actor central del sistema |
| MÓDULO | id_modulo | Unidad temática de aprendizaje |
| ACTIVIDAD | id_actividad | Ejercicio interactivo ejecutable |
| REPORTE | id_reporte | Documento de progreso exportable |

## Entidades Débiles (3)

| Entidad Débil | Depende de | Discriminador | Justificación |
|--------------|-----------|---------------|---------------|
| MATRÍCULA | USUARIO + INSTITUCIÓN | id_usuario + id_institucion | Sin usuario ni institución no hay matrícula. Materializa la relación N:M. |
| PROGRESO_ESTUDIANTE | USUARIO + ACTIVIDAD | id_estudiante + id_actividad | El progreso solo existe para un estudiante en una actividad concreta. |
| HISTORIAL_PRACTICA | USUARIO + MÓDULO | id_estudiante + id_modulo | El historial solo existe para un estudiante que completó un módulo específico. |

## Relaciones con Cardinalidades

| ID | Relación | Entidades | Cardinalidad | Justificación | RF |
|----|---------|-----------|-------------|---------------|-----|
| REL-01 | tiene asignado | USUARIO — ROL | N:1 | Un usuario tiene exactamente 1 rol. Un rol puede tener muchos usuarios. | RF-006 |
| REL-02 | pertenece a | USUARIO — NIVEL_EDUCATIVO | N:1 | Cada estudiante está en un nivel K-12. Un nivel agrupa muchos usuarios. | RF-001 |
| REL-03 | se matricula en | USUARIO — INSTITUCIÓN | N:M | Un usuario puede estar en varias instituciones. Vía MATRÍCULA (entidad débil). | RF-001 |
| REL-04 | dirigido a | MÓDULO — NIVEL_EDUCATIVO | N:1 | Un módulo tiene un nivel objetivo. Un nivel tiene muchos módulos. | RF-007 |
| REL-05 | clasifica en | MÓDULO — TIPO_CONTENIDO | N:1 | Un módulo pertenece a un tipo de contenido. Un tipo agrupa varios módulos. | RF-007 |
| REL-06 | contiene | MÓDULO — ACTIVIDAD | 1:N | Composición: si se elimina el módulo, sus actividades desaparecen. | RF-012 |
| REL-07 | clasifica en | ACTIVIDAD — TIPO_ACTIVIDAD | N:1 | Una actividad tiene un tipo pedagógico (3FN). Un tipo agrupa muchas actividades. | RF-012 |
| REL-08 | crea | USUARIO(Docente) — ACTIVIDAD | 1:N | Un docente crea muchas actividades. Cada actividad tiene un docente responsable. | RF-012 |
| REL-09 | gestiona | USUARIO(Docente) — MÓDULO | 1:N | Un docente es responsable de uno o más módulos. | RF-007 |
| REL-10 | genera | USUARIO(Est.) — PROGRESO_ESTUDIANTE | 1:N | Un estudiante genera un progreso por actividad realizada. | RF-017 |
| REL-11 | origina | ACTIVIDAD — PROGRESO_ESTUDIANTE | 1:N | Una actividad puede tener progreso de muchos estudiantes. | RF-016 |
| REL-12 | acumula | USUARIO(Est.) — HISTORIAL_PRACTICA | 1:N | Un estudiante tiene un historial por módulo completado. | RF-018 |
| REL-13 | es registrado en | MÓDULO — HISTORIAL_PRACTICA | 1:N | Un módulo aparece en el historial de muchos estudiantes. | RF-018 |
| REL-14 | genera | USUARIO(Doc/Admin) — REPORTE | 1:N | Un docente o admin puede generar múltiples reportes. | RF-022,023 |
| REL-15 | referenciada en | INSTITUCIÓN — REPORTE | 1:N | Una institución puede tener muchos reportes sobre ella. | RF-023 |
