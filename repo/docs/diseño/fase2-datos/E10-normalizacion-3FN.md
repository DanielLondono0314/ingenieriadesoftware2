# E10 · Normalización (3FN)

## Descripción
Documentación de los 8 cambios realizados durante el proceso de normalización del esquema de base de datos, desde el diseño inicial hasta la Tercera Forma Normal (3FN).

---

## Primera Forma Normal (1FN)
**Criterio:** Cada atributo contiene un único valor atómico. No hay grupos repetitivos. Existe clave primaria definida.

### Cambio 1FN-01 — Tabla MÓDULO
| | Detalle |
|-|---------|
| **Problema** | El campo `tipo` era un ENUM embebido (`fundamentos`, `ética`, `programación`, `robótica`) dentro del mismo registro de MÓDULO. Viola atomicidad porque el tipo es una entidad con atributos propios. |
| **Solución** | Crear tabla auxiliar `TIPO_CONTENIDO` con `id_tipo_contenido (PK)` y `nombre_tipo (UNIQUE)`. MÓDULO pierde el ENUM `tipo` y gana la FK `id_tipo_contenido`. |
| **Resultado** | +1 tabla auxiliar. Catálogo extensible sin modificar el esquema. |

### Cambio 1FN-02 — Tabla ACTIVIDAD
| | Detalle |
|-|---------|
| **Problema** | El campo `tipo` era un ENUM embebido (`cuestionario`, `simulación`, `ejercicio`, `debate`) dentro de ACTIVIDAD. Mismo problema de atomicidad y rigidez. |
| **Solución** | Crear tabla auxiliar `TIPO_ACTIVIDAD` con `id_tipo_actividad (PK)` y `nombre_tipo (UNIQUE)`. ACTIVIDAD gana FK `id_tipo_actividad`. |
| **Resultado** | +1 tabla auxiliar. El catálogo es extensible sin cambios de esquema. |

### Cambio 1FN-03 — Tablas USUARIO y MÓDULO
| | Detalle |
|-|---------|
| **Problema** | El campo `grado_curso` en USUARIO almacenaba texto libre como `"6A, 7B"` — potencialmente multivaluado. El campo `nivel_educativo` en MÓDULO también era texto repetido entre tablas. |
| **Solución** | Crear tabla `NIVEL_EDUCATIVO` con `id_nivel (PK)`, `codigo_nie (UNIQUE)`, `nombre_nivel` y `rango_grado`. USUARIO y MÓDULO referencian `id_nivel` vía FK. |
| **Resultado** | +1 tabla. Elimina texto libre y repetición entre tablas. |

---

## Segunda Forma Normal (2FN)
**Criterio:** Cumple 1FN Y todos los atributos no-clave dependen de la clave primaria COMPLETA. Aplica especialmente a tablas con claves compuestas.

### Cambio 2FN-01 — Tabla MATRÍCULA
| | Detalle |
|-|---------|
| **Problema** | Podrían incluirse atributos del usuario (nombre, correo) o de la institución (nombre, municipio) en MATRÍCULA. Estos dependerían solo de `id_usuario` o `id_institucion`, no de la PK completa. |
| **Solución** | MATRÍCULA solo contiene `(id_matricula, id_usuario FK, id_institucion FK, fecha_matricula)`. Los atributos del usuario viven en USUARIO y los de institución en INSTITUCIÓN. |
| **Resultado** | Elimina dependencias parciales. Sin redundancia de datos. |

### Cambio 2FN-02 — Tablas PROGRESO_ESTUDIANTE e HISTORIAL_PRACTICA
| | Detalle |
|-|---------|
| **Problema** | Datos del estudiante (nombre, correo) o de la actividad/módulo (título, descripción) podrían copiarse directamente en estas tablas. Crearían dependencia de solo parte de la PK compuesta. |
| **Solución** | Solo contienen atributos propios + FK. Los datos de entidades padre se obtienen vía JOIN. |
| **Resultado** | Elimina dependencias parciales en claves compuestas. |

---

## Tercera Forma Normal (3FN)
**Criterio:** Cumple 2FN Y no existen dependencias transitivas. Todo atributo no-clave depende directamente de la PK.

### Cambio 3FN-01 — Campo `tiempo_empleado` en HISTORIAL_PRACTICA
| | Detalle |
|-|---------|
| **Problema** | El campo calculado `tiempo_empleado` dependía transitivamente: `id_historial → fecha_fin → fecha_inicio → tiempo_empleado`. Almacenarlo crea riesgo de inconsistencia. |
| **Solución** | **Eliminar el campo del esquema físico.** Se calcula en consulta: `SELECT (fecha_fin - fecha_inicio) AS tiempo_empleado FROM HISTORIAL_PRACTICA`. |
| **Resultado** | Elimina dependencia transitiva. Datos siempre consistentes y actualizados. |

### Cambio 3FN-02 — Campo `modulos_completados` en PROGRESO_ESTUDIANTE
| | Detalle |
|-|---------|
| **Problema** | El campo calculado `modulos_completados` dependía transitivamente de un `COUNT` sobre registros con `estado='completado'`, usando datos de la misma tabla. |
| **Solución** | **Eliminar el campo.** Se calcula en consulta: `SELECT COUNT(*) FROM PROGRESO_ESTUDIANTE WHERE id_estudiante=X AND estado='completado'`. |
| **Resultado** | Elimina dependencia transitiva. Sin riesgo de inconsistencia. |

### Cambio 3FN-03 — Campo `estado` en USUARIO
| | Detalle |
|-|---------|
| **Problema** | El campo `estado` (activo/inactivo) de USUARIO dependía transitivamente de `id_usuario → id_rol → ROL.activo`. Duplicaba información ya presente en la tabla ROL. |
| **Solución** | **Eliminar `estado` de USUARIO.** El estado se gestiona a través de `ROL.activo`. Al desactivar un rol, todos los usuarios con ese rol quedan inactivos. |
| **Resultado** | Elimina dependencia transitiva `usuario → rol → activo`. |

### Cambio 3FN-04 — Descripción del nivel en MÓDULO
| | Detalle |
|-|---------|
| **Problema** | El campo `descripcion_nivel` (texto del nivel educativo) dependía transitivamente de `MÓDULO.id_nivel → NIVEL_EDUCATIVO.nombre_nivel`. Duplicaba datos de otra tabla. |
| **Solución** | MÓDULO solo almacena la FK `id_nivel`. La descripción y nombre del nivel se obtienen con JOIN a `NIVEL_EDUCATIVO`. |
| **Resultado** | Elimina dependencia transitiva entre tablas. |

---

## Resumen de Cambios

| FN | Cambio | Tabla | Resultado |
|----|--------|-------|-----------|
| 1FN | Extraer ENUM tipo contenido | MÓDULO | +1 tabla TIPO_CONTENIDO |
| 1FN | Extraer ENUM tipo actividad | ACTIVIDAD | +1 tabla TIPO_ACTIVIDAD |
| 1FN | Extraer nivel educativo de texto | USUARIO, MÓDULO | +1 tabla NIVEL_EDUCATIVO |
| 2FN | Aislar atributos propios | MATRÍCULA | Solo FK + fecha |
| 2FN | Aislar atributos propios | PROGRESO, HISTORIAL | Solo datos propios + FK |
| 3FN | Eliminar tiempo_empleado calculado | HISTORIAL_PRACTICA | Calculado en consulta |
| 3FN | Eliminar modulos_completados calculado | PROGRESO_ESTUDIANTE | COUNT en consulta |
| 3FN | Eliminar estado duplicado | USUARIO | Gestionado por ROL.activo |
