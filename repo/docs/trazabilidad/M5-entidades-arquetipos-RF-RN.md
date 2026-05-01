# M5 · Entidades → Arquetipos → RF → Reglas de Negocio

| Entidad | ARQ | RF | Tipo | Reglas de Negocio Principales |
|---------|-----|----|------|-------------------------------|
| USUARIO | ARQ-01 | RF-001 a 006 | Fuerte | correo UNIQUE · contrasena=hash bcrypt · 1 rol exacto · desactivación sin borrar historial |
| ROL | ARQ-02 | RF-006 | Fuerte | nombre_rol CHECK(5 valores) · Solo admin asigna roles · activo BOOLEAN |
| NIVEL_EDUCATIVO | ARQ-05 | RF-007,008 | Fuerte (3FN) | codigo_nie UNIQUE · Todo módulo y estudiante tiene nivel · Filtra contenido visible |
| INSTITUCIÓN | ARQ-03 | RF-001,002 | Fuerte | tipo CHECK('publica','privada') · N:M con USUARIO vía MATRÍCULA |
| MATRÍCULA | ARQ-04 | RF-001 | Débil | UNIQUE(id_usuario,id_institucion) · Depende de USUARIO e INSTITUCIÓN |
| MÓDULO | ARQ-06 | RF-007 a 011 | Fuerte | FK tipo_contenido y nivel · activo BOOLEAN · Solo admin gestiona |
| TIPO_CONTENIDO | ARQ-07 | RF-007 | Fuerte (3FN) | nombre_tipo UNIQUE · No eliminar si tiene módulos |
| ACTIVIDAD | ARQ-08 | RF-012 a 016 | Fuerte | puntaje_maximo > 0 · Solo docente/admin crea · CASCADE con módulo |
| TIPO_ACTIVIDAD | ARQ-09 | RF-012 | Fuerte (3FN) | nombre_tipo UNIQUE · No eliminar si tiene actividades |
| PROGRESO_ESTUDIANTE | ARQ-10 | RF-017,020 | Débil | UNIQUE(est,act) · estado IN(completado,en_progreso) · modulos_completados CALCULADO |
| HISTORIAL_PRACTICA | ARQ-11 | RF-018,019,021 | Débil | tiempo_empleado CALCULADO · Solo admin elimina |
| REPORTE | ARQ-12 | RF-022,023 | Fuerte | tipo CHECK(3 valores) · formato CHECK(PDF,Excel) · contenido_url NOT NULL |
