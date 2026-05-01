# M7 · Tablas Relacionales → MER → PK → FK → Forma Normal

| Tabla | ARQ | PK | FKs Definidas | Forma Normal | Cambio 3FN Aplicado |
|-------|-----|----|--------------|-------------|---------------------|
| ROL | ARQ-02 | id_rol SERIAL | — | 1FN, 2FN, 3FN | — |
| NIVEL_EDUCATIVO | ARQ-05 | id_nivel SERIAL | — | 1FN, 2FN, 3FN | Creada en 1FN para eliminar texto libre en USUARIO/MÓDULO |
| TIPO_CONTENIDO | ARQ-07 | id_tipo_contenido SERIAL | — | 1FN, 2FN, 3FN | Creada en 1FN para eliminar ENUM en MÓDULO |
| TIPO_ACTIVIDAD | ARQ-09 | id_tipo_actividad SERIAL | — | 1FN, 2FN, 3FN | Creada en 1FN para eliminar ENUM en ACTIVIDAD |
| INSTITUCIÓN | ARQ-03 | id_institucion SERIAL | — | 1FN, 2FN, 3FN | — |
| USUARIO | ARQ-01 | id_usuario SERIAL | id_rol INT, id_nivel INT | 1FN, 2FN, 3FN | Eliminado campo 'estado' (dep. transitiva → ROL.activo) |
| MATRÍCULA | ARQ-04 | id_matricula SERIAL | id_usuario CASCADE, id_institucion CASCADE | 1FN, 2FN, 3FN | Solo FK+fecha. Atributos padre en sus tablas (2FN) |
| MÓDULO | ARQ-06 | id_modulo SERIAL | id_tipo_contenido, id_nivel, id_docente | 1FN, 2FN, 3FN | Eliminado texto libre de nivel y tipo (1FN + 3FN) |
| ACTIVIDAD | ARQ-08 | id_actividad SERIAL | id_tipo_actividad, id_modulo CASCADE, id_docente | 1FN, 2FN, 3FN | Eliminado ENUM tipo (1FN). Solo atributos propios (2FN) |
| PROGRESO_ESTUDIANTE | ARQ-10 | id_progreso SERIAL | id_estudiante CASCADE, id_actividad CASCADE | 1FN, 2FN, 3FN | Eliminado modulos_completados calculado (3FN) |
| HISTORIAL_PRACTICA | ARQ-11 | id_historial SERIAL | id_estudiante CASCADE, id_modulo RESTRICT | 1FN, 2FN, 3FN | Eliminado tiempo_empleado calculado (3FN) |
| REPORTE | ARQ-12 | id_reporte SERIAL | id_generado_por RESTRICT, id_institucion SET NULL | 1FN, 2FN, 3FN | — |
