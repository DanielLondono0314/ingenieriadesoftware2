# E9 · Modelo Relacional

## Descripción
12 tablas relacionales con tipos de datos SQL (PostgreSQL 15), claves primarias, foráneas y constraints.

## Tablas

### ROL
```
ROL(id_rol SERIAL PK, nombre_rol VARCHAR(50) UNIQUE CHECK(5 roles), descripcion TEXT, permisos JSONB, activo BOOLEAN DEFAULT TRUE)
```

### NIVEL_EDUCATIVO
```
NIVEL_EDUCATIVO(id_nivel SERIAL PK, codigo_nie VARCHAR(20) UNIQUE, nombre_nivel VARCHAR(100), rango_grado VARCHAR(20))
```

### TIPO_CONTENIDO
```
TIPO_CONTENIDO(id_tipo_contenido SERIAL PK, nombre_tipo VARCHAR(100) UNIQUE, descripcion TEXT)
```

### TIPO_ACTIVIDAD
```
TIPO_ACTIVIDAD(id_tipo_actividad SERIAL PK, nombre_tipo VARCHAR(100) UNIQUE, descripcion TEXT)
```

### INSTITUCIÓN
```
INSTITUCIÓN(id_institucion SERIAL PK, nombre VARCHAR(200), municipio VARCHAR(100), tipo VARCHAR(10) CHECK('publica','privada'), niveles_educativos TEXT, contacto VARCHAR(200))
```

### USUARIO
```
USUARIO(id_usuario SERIAL PK, nombre VARCHAR(100), apellido VARCHAR(100), correo VARCHAR(150) UNIQUE CHECK(email), contrasena VARCHAR(255),
  id_rol INT FK→ROL, id_nivel INT FK→NIVEL_EDUCATIVO, fecha_registro TIMESTAMP DEFAULT NOW())
```

### MATRÍCULA
```
MATRÍCULA(id_matricula SERIAL PK, id_usuario INT FK→USUARIO ON DELETE CASCADE, id_institucion INT FK→INSTITUCIÓN ON DELETE CASCADE,
  fecha_matricula TIMESTAMP DEFAULT NOW(), UNIQUE(id_usuario, id_institucion))
```

### MÓDULO
```
M�DULO(id_modulo SERIAL PK, titulo VARCHAR(200), descripcion TEXT, id_tipo_contenido INT FK→TIPO_CONTENIDO,
  id_nivel INT FK→NIVEL_EDUCATIVO, area_curricular VARCHAR(100), id_docente INT FK→USUARIO, activo BOOLEAN DEFAULT TRUE)
```

### ACTIVIDAD
```
ACTIVIDAD(id_actividad SERIAL PK, titulo VARCHAR(200), descripcion TEXT, id_tipo_actividad INT FK→TIPO_ACTIVIDAD,
  id_modulo INT FK→MÓDULO ON DELETE CASCADE, id_docente INT FK→USUARIO, instrucciones TEXT,
  criterio_evaluacion TEXT, puntaje_maximo INT CHECK(>0), fecha_creacion TIMESTAMP DEFAULT NOW())
```

### PROGRESO_ESTUDIANTE
```
PROGRESO_ESTUDIANTE(id_progreso SERIAL PK, id_estudiante INT FK→USUARIO, id_actividad INT FK→ACTIVIDAD,
  puntaje_obtenido NUMERIC(6,2) DEFAULT 0, fecha_realizacion TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(20) CHECK('completado','en_progreso') DEFAULT 'en_progreso',
  retroalimentacion JSONB, UNIQUE(id_estudiante, id_actividad))
```

### HISTORIAL_PRACTICA
```
HISTORIAL_PRACTICA(id_historial SERIAL PK, id_estudiante INT FK→USUARIO, id_modulo INT FK→MÓDULO,
  fecha_inicio TIMESTAMP, fecha_fin TIMESTAMP, puntaje_total NUMERIC(8,2) DEFAULT 0,
  actividades_completadas INT DEFAULT 0, modulo_aprobado BOOLEAN DEFAULT FALSE)
```
> **Nota 3FN:** `tiempo_empleado` = (fecha_fin - fecha_inicio) — calculado en consulta, no almacenado

### REPORTE
```
REPORTE(id_reporte SERIAL PK, tipo VARCHAR(20) CHECK('individual','grupal','global'), rango VARCHAR(300),
  fecha_generacion TIMESTAMP DEFAULT NOW(), id_generado_por INT FK→USUARIO,
  id_institucion INT FK→INSTITUCIÓN NULL, formato VARCHAR(10) CHECK('PDF','Excel'), contenido_url VARCHAR(500))
```

## Índices de Rendimiento (RNF-001, RNF-002)

| Índice | Tabla | Campo | Justificación |
|--------|-------|-------|---------------|
| idx_usuario_correo | USUARIO | correo | Búsqueda de autenticación |
| idx_modulo_nivel | MÓDULO | id_nivel | Filtro por nivel educativo |
| idx_modulo_activo | MÓDULO | activo | Catálogo de módulos activos |
| idx_actividad_modulo | ACTIVIDAD | id_modulo | Actividades de un módulo |
| idx_progreso_est | PROGRESO_ESTUDIANTE | id_estudiante | Progreso del estudiante |
| idx_progreso_act | PROGRESO_ESTUDIANTE | id_actividad | Progreso por actividad |
| idx_historial_est | HISTORIAL_PRACTICA | id_estudiante | Historial del estudiante |
| idx_historial_mod | HISTORIAL_PRACTICA | id_modulo | Historial de un módulo |
