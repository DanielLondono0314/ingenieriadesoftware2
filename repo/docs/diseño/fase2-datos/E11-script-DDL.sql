-- ============================================================
-- DDL — Plataforma Alfabetización en IA K-12
-- Motor: PostgreSQL 15 | Esquema: 3FN
-- Repositorio: DanielLondono0314/ingenieriadesoftware2
-- ============================================================

DROP TABLE IF EXISTS REPORTE, HISTORIAL_PRACTICA, PROGRESO_ESTUDIANTE, ACTIVIDAD,
    TIPO_ACTIVIDAD, MODULO, TIPO_CONTENIDO, MATRICULA, USUARIO,
    INSTITUCION, NIVEL_EDUCATIVO, ROL CASCADE;

-- ── Tablas Auxiliares (3FN) ──────────────────────────────

CREATE TABLE ROL (
    id_rol      SERIAL PRIMARY KEY,
    nombre_rol  VARCHAR(50) NOT NULL UNIQUE
                CHECK (nombre_rol IN ('Estudiante','Docente','Administrador','Coordinador','Directivo')),
    descripcion TEXT,
    permisos    JSONB,
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE NIVEL_EDUCATIVO (
    id_nivel     SERIAL PRIMARY KEY,
    codigo_nie   VARCHAR(20) NOT NULL UNIQUE,
    nombre_nivel VARCHAR(100) NOT NULL,
    rango_grado  VARCHAR(20) NOT NULL
);

CREATE TABLE TIPO_CONTENIDO (
    id_tipo_contenido SERIAL PRIMARY KEY,
    nombre_tipo       VARCHAR(100) NOT NULL UNIQUE,
    descripcion       TEXT
);

CREATE TABLE TIPO_ACTIVIDAD (
    id_tipo_actividad SERIAL PRIMARY KEY,
    nombre_tipo       VARCHAR(100) NOT NULL UNIQUE,
    descripcion       TEXT
);

-- ── Entidades Principales ────────────────────────────────

CREATE TABLE INSTITUCION (
    id_institucion     SERIAL PRIMARY KEY,
    nombre             VARCHAR(200) NOT NULL,
    municipio          VARCHAR(100) NOT NULL,
    tipo               VARCHAR(10) CHECK (tipo IN ('publica','privada')),
    niveles_educativos TEXT,
    contacto           VARCHAR(200)
);

CREATE TABLE USUARIO (
    id_usuario      SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE
                    CHECK (correo ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
    contrasena      VARCHAR(255) NOT NULL,  -- Hash bcrypt — NUNCA texto plano (RNF-004)
    id_rol          INT NOT NULL REFERENCES ROL(id_rol),
    id_nivel        INT REFERENCES NIVEL_EDUCATIVO(id_nivel),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW(),
    -- Estados del ciclo de vida del usuario (E14-DE03). desactivar() → 'inactivo'
    -- conserva el historial académico; nunca se borra físicamente.
    estado          VARCHAR(20) NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('pendiente','activo','bloqueado_temporal','inactivo','eliminado_logico'))
);

CREATE TABLE MATRICULA (
    id_matricula   SERIAL PRIMARY KEY,
    id_usuario     INT NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
    id_institucion INT NOT NULL REFERENCES INSTITUCION(id_institucion) ON DELETE CASCADE,
    fecha_matricula TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_usuario, id_institucion)
);

CREATE TABLE MODULO (
    id_modulo         SERIAL PRIMARY KEY,
    titulo            VARCHAR(200) NOT NULL,
    descripcion       TEXT NOT NULL,
    id_tipo_contenido INT NOT NULL REFERENCES TIPO_CONTENIDO(id_tipo_contenido),
    id_nivel          INT NOT NULL REFERENCES NIVEL_EDUCATIVO(id_nivel),
    area_curricular   VARCHAR(100),
    id_docente        INT NOT NULL REFERENCES USUARIO(id_usuario),
    activo            BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE ACTIVIDAD (
    id_actividad       SERIAL PRIMARY KEY,
    titulo             VARCHAR(200) NOT NULL,
    descripcion        TEXT NOT NULL,
    id_tipo_actividad  INT NOT NULL REFERENCES TIPO_ACTIVIDAD(id_tipo_actividad),
    id_modulo          INT NOT NULL REFERENCES MODULO(id_modulo) ON DELETE CASCADE,
    id_docente         INT NOT NULL REFERENCES USUARIO(id_usuario),
    instrucciones      TEXT NOT NULL,
    criterio_evaluacion TEXT NOT NULL,
    puntaje_maximo     INT NOT NULL CHECK (puntaje_maximo > 0),
    fecha_creacion     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Entidades de Seguimiento (Débiles) ───────────────────

CREATE TABLE PROGRESO_ESTUDIANTE (
    id_progreso       SERIAL PRIMARY KEY,
    id_estudiante     INT NOT NULL REFERENCES USUARIO(id_usuario),
    id_actividad      INT NOT NULL REFERENCES ACTIVIDAD(id_actividad),
    puntaje_obtenido  NUMERIC(6,2) DEFAULT 0,
    fecha_realizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    estado            VARCHAR(20) NOT NULL DEFAULT 'en_progreso'
                      CHECK (estado IN ('completado','en_progreso')),
    retroalimentacion JSONB,
    -- Nota 3FN: modulos_completados NO se almacena — se calcula con COUNT(*)
    UNIQUE (id_estudiante, id_actividad)
);

CREATE TABLE HISTORIAL_PRACTICA (
    id_historial            SERIAL PRIMARY KEY,
    id_estudiante           INT NOT NULL REFERENCES USUARIO(id_usuario),
    id_modulo               INT NOT NULL REFERENCES MODULO(id_modulo),
    fecha_inicio            TIMESTAMP NOT NULL,
    fecha_fin               TIMESTAMP NOT NULL,
    puntaje_total           NUMERIC(8,2) NOT NULL DEFAULT 0,
    actividades_completadas INT NOT NULL DEFAULT 0,
    modulo_aprobado         BOOLEAN NOT NULL DEFAULT FALSE
    -- Nota 3FN: tiempo_empleado = (fecha_fin - fecha_inicio) — calculado en consulta
);

-- ── Reportes ─────────────────────────────────────────────

CREATE TABLE REPORTE (
    id_reporte       SERIAL PRIMARY KEY,
    tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('individual','grupal','global')),
    rango            VARCHAR(300) NOT NULL,
    fecha_generacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_generado_por  INT NOT NULL REFERENCES USUARIO(id_usuario),
    id_institucion   INT REFERENCES INSTITUCION(id_institucion),
    formato          VARCHAR(10) NOT NULL CHECK (formato IN ('PDF','Excel')),
    contenido_url    VARCHAR(500) NOT NULL
);

-- ── Índices de Rendimiento (RNF-001, RNF-002) ────────────

CREATE INDEX idx_usuario_correo  ON USUARIO(correo);
CREATE INDEX idx_modulo_nivel    ON MODULO(id_nivel);
CREATE INDEX idx_modulo_activo   ON MODULO(activo);
CREATE INDEX idx_actividad_mod   ON ACTIVIDAD(id_modulo);
CREATE INDEX idx_progreso_est    ON PROGRESO_ESTUDIANTE(id_estudiante);
CREATE INDEX idx_progreso_act    ON PROGRESO_ESTUDIANTE(id_actividad);
CREATE INDEX idx_historial_est   ON HISTORIAL_PRACTICA(id_estudiante);
CREATE INDEX idx_historial_mod   ON HISTORIAL_PRACTICA(id_modulo);

-- ── Seed Data ────────────────────────────────────────────

INSERT INTO ROL(nombre_rol, descripcion, activo) VALUES
    ('Estudiante',     'Accede a módulos y actividades interactivas', TRUE),
    ('Docente',        'Crea actividades y hace seguimiento del grupo', TRUE),
    ('Administrador',  'Gestión total de la plataforma', TRUE),
    ('Coordinador',    'Supervisa el avance institucional', TRUE),
    ('Directivo',      'Acceso a reportes de nivel directivo', TRUE);

INSERT INTO NIVEL_EDUCATIVO(codigo_nie, nombre_nivel, rango_grado) VALUES
    ('NIE-001', 'Primaria Baja', 'K-2'),
    ('NIE-002', 'Primaria Alta', '3-5'),
    ('NIE-003', 'Secundaria',   '6-8'),
    ('NIE-004', 'Media',        '9-12');

INSERT INTO TIPO_CONTENIDO(nombre_tipo, descripcion) VALUES
    ('Fundamentos IA',   'Conceptos básicos, historia y tipos de IA'),
    ('Ética en IA',      'Privacidad, sesgos, responsabilidad e impacto social'),
    ('Programación IA',  'Algoritmos básicos, lógica computacional y pseudocódigo'),
    ('Robótica',         'Aplicaciones físicas de IA, sensores y actuadores');

INSERT INTO TIPO_ACTIVIDAD(nombre_tipo, descripcion) VALUES
    ('Cuestionario',       'Preguntas de selección múltiple o verdadero/falso'),
    ('Simulación',         'Actividad interactiva que simula un proceso de IA'),
    ('Ejercicio Práctico', 'Resolución de problemas aplicados a la IA'),
    ('Debate',             'Discusión guiada sobre aspectos éticos o sociales de la IA');

-- ── Vista de Consulta ─────────────────────────────────────

CREATE VIEW v_progreso_completo AS
SELECT
    u.nombre || ' ' || u.apellido AS estudiante,
    m.titulo                      AS modulo,
    a.titulo                      AS actividad,
    pe.estado,
    pe.puntaje_obtenido,
    a.puntaje_maximo,
    ROUND((pe.puntaje_obtenido / a.puntaje_maximo) * 100, 1) AS porcentaje,
    -- tiempo_empleado calculado en consulta (3FN)
    pe.fecha_realizacion
FROM PROGRESO_ESTUDIANTE pe
JOIN USUARIO   u ON pe.id_estudiante = u.id_usuario
JOIN ACTIVIDAD a ON pe.id_actividad  = a.id_actividad
JOIN MODULO    m ON a.id_modulo      = m.id_modulo
ORDER BY u.id_usuario, m.id_modulo, a.id_actividad;
