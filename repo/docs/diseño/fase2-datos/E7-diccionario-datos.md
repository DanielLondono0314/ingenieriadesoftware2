# E7 · Diccionario de Datos

## Descripción
12 entidades con descripción semántica, atributos abstractos y reglas de negocio. Cada entidad corresponde a un arquetipo del Diagrama de Arquetipos (E4).

---

## USUARIO (ARQ-01)
**Tipo:** Entidad fuerte  
**RF relacionados:** RF-001 a RF-006

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_usuario | SERIAL | PK, NOT NULL | Identificador único autogenerado |
| nombre | VARCHAR(100) | NOT NULL | Nombre(s) del usuario |
| apellido | VARCHAR(100) | NOT NULL | Apellido(s) del usuario |
| correo | VARCHAR(150) | NOT NULL, UNIQUE | Correo electrónico — formato RFC 5322 |
| contrasena | VARCHAR(255) | NOT NULL | **Hash bcrypt** — NUNCA texto plano (RNF-004) |
| id_rol | INT | FK → ROL, NOT NULL | Rol asignado — determina permisos |
| id_nivel | INT | FK → NIVEL_EDUCATIVO, NULL | Nivel educativo (aplica a estudiantes) |
| fecha_registro | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha y hora de creación |
| estado | VARCHAR(20) | NOT NULL, DEFAULT 'activo', CHECK IN (5 estados) | Ciclo de vida E14-DE03: pendiente/activo/bloqueado_temporal/inactivo/eliminado_logico |

**Reglas de negocio:** correo UNIQUE · contrasena=hash bcrypt · 1 rol exacto · desactivación sin borrar historial

---

## ROL (ARQ-02)
**Tipo:** Entidad fuerte auxiliar 3FN  
**RF relacionados:** RF-006

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_rol | SERIAL | PK, NOT NULL | Identificador único |
| nombre_rol | VARCHAR(50) | NOT NULL, UNIQUE | CHECK IN (5 roles válidos) |
| descripcion | TEXT | NULL | Descripción del alcance del rol |
| permisos | JSONB | NULL | Lista de permisos en formato JSON |
| activo | BOOLEAN | NOT NULL, DEFAULT TRUE | Estado habilitado/deshabilitado |

---

## NIVEL_EDUCATIVO (ARQ-05)
**Tipo:** Entidad fuerte auxiliar — surgió de normalización 1FN  
**RF relacionados:** RF-007, RF-008

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_nivel | SERIAL | PK, NOT NULL | Identificador único |
| codigo_nie | VARCHAR(20) | NOT NULL, UNIQUE | Código estándar NIE — ej: NIE-001 |
| nombre_nivel | VARCHAR(100) | NOT NULL | Nombre descriptivo — ej: Primaria Baja |
| rango_grado | VARCHAR(20) | NOT NULL | Rango de grados — ej: K-2, 3-5, 6-8, 9-12 |

---

## INSTITUCIÓN (ARQ-03)
**Tipo:** Entidad fuerte  
**RF relacionados:** RF-001, RF-002

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_institucion | SERIAL | PK, NOT NULL | Identificador único |
| nombre | VARCHAR(200) | NOT NULL | Nombre oficial de la institución |
| municipio | VARCHAR(100) | NOT NULL | Municipio o ciudad donde opera |
| tipo | VARCHAR(10) | CHECK IN ('publica','privada') | Tipo de institución |
| niveles_educativos | TEXT | NULL | Descripción de niveles que ofrece |
| contacto | VARCHAR(200) | NULL | Email y/o teléfono del responsable |

---

## MATRÍCULA (ARQ-04) — ENTIDAD DÉBIL
**Tipo:** Entidad débil — depende de USUARIO e INSTITUCIÓN  
**RF relacionados:** RF-001

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_matricula | SERIAL | PK, NOT NULL | Identificador único |
| id_usuario | INT | FK → USUARIO, NOT NULL | Usuario matriculado (identificador débil) |
| id_institucion | INT | FK → INSTITUCIÓN, NOT NULL | Institución (identificador débil) |
| fecha_matricula | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de matrícula |

**Constraint:** UNIQUE(id_usuario, id_institucion)

---

## TIPO_CONTENIDO (ARQ-07)
**Tipo:** Entidad fuerte auxiliar — surgió de normalización 1FN  
**RF relacionados:** RF-007

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_tipo_contenido | SERIAL | PK, NOT NULL | Identificador único |
| nombre_tipo | VARCHAR(100) | NOT NULL, UNIQUE | Categoría temática — ej: Fundamentos IA |
| descripcion | TEXT | NULL | Descripción del alcance temático |

---

## MÓDULO (ARQ-06)
**Tipo:** Entidad fuerte  
**RF relacionados:** RF-007 a RF-011

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_modulo | SERIAL | PK, NOT NULL | Identificador único |
| titulo | VARCHAR(200) | NOT NULL | Título descriptivo del módulo |
| descripcion | TEXT | NOT NULL | Descripción detallada del contenido |
| id_tipo_contenido | INT | FK → TIPO_CONTENIDO, NOT NULL | Tipo temático (3FN) |
| id_nivel | INT | FK → NIVEL_EDUCATIVO, NOT NULL | Nivel educativo objetivo (3FN) |
| area_curricular | VARCHAR(100) | NULL | Área del currículo escolar |
| id_docente | INT | FK → USUARIO, NOT NULL | Docente responsable |
| activo | BOOLEAN | NOT NULL, DEFAULT TRUE | Visibilidad para estudiantes |

---

## TIPO_ACTIVIDAD (ARQ-09)
**Tipo:** Entidad fuerte auxiliar — surgió de normalización 1FN  
**RF relacionados:** RF-012

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_tipo_actividad | SERIAL | PK, NOT NULL | Identificador único |
| nombre_tipo | VARCHAR(100) | NOT NULL, UNIQUE | Tipo pedagógico — ej: Cuestionario |
| descripcion | TEXT | NULL | Descripción de la dinámica del tipo |

---

## ACTIVIDAD (ARQ-08)
**Tipo:** Entidad fuerte  
**RF relacionados:** RF-012 a RF-016

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_actividad | SERIAL | PK, NOT NULL | Identificador único |
| titulo | VARCHAR(200) | NOT NULL | Título de la actividad |
| descripcion | TEXT | NOT NULL | Objetivo pedagógico |
| id_tipo_actividad | INT | FK → TIPO_ACTIVIDAD, NOT NULL | Tipo pedagógico (3FN) |
| id_modulo | INT | FK → MÓDULO, NOT NULL, ON DELETE CASCADE | Módulo al que pertenece |
| id_docente | INT | FK → USUARIO, NOT NULL | Docente que la creó |
| instrucciones | TEXT | NOT NULL | Guía paso a paso para el estudiante |
| criterio_evaluacion | TEXT | NOT NULL | Rúbrica de evaluación |
| puntaje_maximo | INT | NOT NULL, CHECK (> 0) | Techo máximo de puntaje |
| fecha_creacion | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |

---

## PROGRESO_ESTUDIANTE (ARQ-10) — ENTIDAD DÉBIL
**Tipo:** Entidad débil — depende de USUARIO y ACTIVIDAD  
**RF relacionados:** RF-017, RF-020

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_progreso | SERIAL | PK, NOT NULL | Identificador único |
| id_estudiante | INT | FK → USUARIO, NOT NULL | Estudiante dueño del progreso |
| id_actividad | INT | FK → ACTIVIDAD, NOT NULL | Actividad sobre la que se registra |
| puntaje_obtenido | NUMERIC(6,2) | DEFAULT 0 | Puntaje acumulado |
| fecha_realizacion | TIMESTAMP | NOT NULL, DEFAULT NOW() | Último acceso |
| estado | VARCHAR(20) | CHECK IN ('completado','en_progreso') | Estado de avance |
| retroalimentacion | JSONB | NULL | Retroalimentación del motor |

**Constraint:** UNIQUE(id_estudiante, id_actividad)  
**Nota 3FN:** `modulos_completados` NO se almacena — se calcula en consulta

---

## HISTORIAL_PRACTICA (ARQ-11) — ENTIDAD DÉBIL
**Tipo:** Entidad débil — depende de USUARIO y MÓDULO  
**RF relacionados:** RF-018, RF-019, RF-021

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_historial | SERIAL | PK, NOT NULL | Identificador único |
| id_estudiante | INT | FK → USUARIO, NOT NULL | Estudiante dueño del historial |
| id_modulo | INT | FK → MÓDULO, NOT NULL | Módulo completado |
| fecha_inicio | TIMESTAMP | NOT NULL | Primera vez que accedió al módulo |
| fecha_fin | TIMESTAMP | NOT NULL | Fecha de finalización |
| puntaje_total | NUMERIC(8,2) | NOT NULL, DEFAULT 0 | Suma de puntajes de todas las actividades |
| actividades_completadas | INT | NOT NULL, DEFAULT 0 | Contador de actividades completadas |
| modulo_aprobado | BOOLEAN | NOT NULL, DEFAULT FALSE | TRUE si supera el umbral |

**Nota 3FN:** `tiempo_empleado` NO se almacena — se calcula como (fecha_fin - fecha_inicio)

---

## REPORTE (ARQ-12)
**Tipo:** Entidad fuerte  
**RF relacionados:** RF-022, RF-023

| Atributo | Tipo | Restricción | Descripción |
|----------|------|-------------|-------------|
| id_reporte | SERIAL | PK, NOT NULL | Identificador único |
| tipo | VARCHAR(20) | CHECK IN ('individual','grupal','global') | Alcance del reporte |
| rango | VARCHAR(300) | NOT NULL | Descripción del conjunto de datos |
| fecha_generacion | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de generación |
| id_generado_por | INT | FK → USUARIO, NOT NULL | Usuario que solicitó el reporte |
| id_institucion | INT | FK → INSTITUCIÓN, NULL | Institución referenciada |
| formato | VARCHAR(10) | CHECK IN ('PDF','Excel') | Formato del archivo generado |
| contenido_url | VARCHAR(500) | NOT NULL | URL S3 del archivo generado |
