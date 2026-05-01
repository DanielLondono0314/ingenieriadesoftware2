# M6 · Relaciones MER → Cardinalidades → Reglas de Negocio

| ID | Relación | Entidades | Card. | Regla de Negocio | RF |
|----|---------|-----------|-------|------------------|----|
| REL-01 | tiene asignado | USUARIO — ROL | N:1 | Un usuario tiene exactamente 1 rol. No puede tener 0 ni múltiples simultáneos. | RF-006 |
| REL-02 | pertenece a | USUARIO — NIVEL_EDUCATIVO | N:1 | Cada estudiante tiene un nivel K-12. Determina qué módulos le son visibles. | RF-001 |
| REL-03 | se matricula en | USUARIO — INSTITUCIÓN | N:M | Un usuario puede estar en varias instituciones. Vía entidad débil MATRÍCULA. | RF-001 |
| REL-04 | dirigido a | MÓDULO — NIVEL_EDUCATIVO | N:1 | Un módulo tiene un único nivel objetivo. Un nivel puede tener muchos módulos. | RF-007 |
| REL-05 | clasifica en | MÓDULO — TIPO_CONTENIDO | N:1 | Un módulo pertenece a un tipo de contenido (3FN). Un tipo agrupa varios módulos. | RF-007 |
| REL-06 | contiene | MÓDULO — ACTIVIDAD | 1:N | Composición: si se elimina el módulo, sus actividades desaparecen con él. | RF-012 |
| REL-07 | clasifica en | ACTIVIDAD — TIPO_ACTIVIDAD | N:1 | Una actividad tiene un único tipo pedagógico (3FN). Un tipo agrupa muchas actividades. | RF-012 |
| REL-08 | crea | USUARIO(Docente) — ACTIVIDAD | 1:N | Un docente crea muchas actividades. Cada actividad tiene un docente responsable. | RF-012 |
| REL-09 | genera | USUARIO(Est.) — PROGRESO_ESTUDIANTE | 1:N | Un estudiante genera un registro de progreso por actividad realizada. | RF-017 |
| REL-10 | origina | ACTIVIDAD — PROGRESO_ESTUDIANTE | 1:N | Una actividad puede tener progreso de muchos estudiantes. | RF-016 |
| REL-11 | acumula | USUARIO(Est.) — HISTORIAL_PRACTICA | 1:N | Un estudiante tiene un historial por módulo completado. | RF-018 |
| REL-12 | es registrado en | MÓDULO — HISTORIAL_PRACTICA | 1:N | Un módulo puede aparecer en el historial de muchos estudiantes. | RF-018 |
| REL-13 | genera | USUARIO(Doc/Admin) — REPORTE | 1:N | Un docente o admin puede generar múltiples reportes. | RF-022,023 |
| REL-14 | referenciada en | INSTITUCIÓN — REPORTE | 1:N | Una institución puede tener muchos reportes sobre ella. | RF-023 |
