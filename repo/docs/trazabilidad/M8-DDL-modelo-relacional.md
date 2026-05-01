# M8 · DDL → Modelo Relacional → PK → FK → Restricciones

| Tabla DDL | PK en SQL | FKs con ON DELETE | Constraints Clave | Verificación |
|-----------|-----------|-------------------|-------------------|--------------|
| ROL | SERIAL PRIMARY KEY | — | CHECK nombre_rol IN (5 valores), UNIQUE, NOT NULL | Script DDL — INSERT seed con 5 roles |
| NIVEL_EDUCATIVO | SERIAL PRIMARY KEY | — | codigo_nie UNIQUE, NOT NULL | Script DDL — INSERT seed K-2, 3-5, 6-8, 9-12 |
| USUARIO | SERIAL PRIMARY KEY | id_rol REFERENCES ROL, id_nivel REFERENCES NIVEL_EDUCATIVO | correo UNIQUE, CHECK formato email, contrasena NOT NULL (hash) | Script DDL — CHECK con regex RFC 5322 |
| MATRÍCULA | SERIAL PRIMARY KEY | id_usuario ON DELETE CASCADE, id_institucion ON DELETE CASCADE | UNIQUE(id_usuario,id_institucion) | Script DDL — evita matrícula duplicada |
| MÓDULO | SERIAL PRIMARY KEY | id_tipo_contenido RESTRICT, id_nivel RESTRICT, id_docente RESTRICT | activo BOOLEAN DEFAULT TRUE | Script DDL — RESTRICT protege integridad |
| ACTIVIDAD | SERIAL PRIMARY KEY | id_tipo_actividad RESTRICT, id_modulo CASCADE, id_docente RESTRICT | puntaje_maximo > 0 CHECK | Script DDL — CASCADE elimina con módulo |
| PROGRESO_ESTUDIANTE | SERIAL PRIMARY KEY | id_estudiante CASCADE, id_actividad CASCADE | CHECK estado IN (...), UNIQUE(est,act) | Script DDL — UNIQUE evita doble registro |
| HISTORIAL_PRACTICA | SERIAL PRIMARY KEY | id_estudiante CASCADE, id_modulo RESTRICT | NOT NULL en fechas y puntaje, BOOLEAN modulo_aprobado | Script DDL |
| REPORTE | SERIAL PRIMARY KEY | id_generado_por RESTRICT, id_institucion SET NULL | CHECK tipo IN (3 vals), CHECK formato IN (PDF,Excel) | Script DDL |
