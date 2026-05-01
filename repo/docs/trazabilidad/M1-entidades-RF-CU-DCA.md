# M1 · Entidades Externas → RF → CU → DCA

| ID EC | Entidad Externa | RF Relacionados | CU Relacionados | Referencia DCA |
|-------|----------------|----------------|----------------|----------------|
| EC-01 | Estudiante K-12 | RF-001,005,011,013,016,017,018 | CU-001,CU-002 | Flujo: credenciales/respuestas → módulos/retroalimentación |
| EC-02 | Docente | RF-003,012,014,015,019,022 | CU-003,CU-004,CU-005 | Flujo: actividades/seguimiento → panel/reportes |
| EC-03 | Administrador | RF-001,004,006,007,009,021,023 | CU-002,CU-003 | Flujo: usuarios/módulos/config → confirmaciones/reportes globales |
| EC-04 | Sist. Autenticación | RF-005 | CU-001 (A1: sesión exp.) | Valida bcrypt. Bloqueo 15 min (RNF-005). Genera JWT. |
| EC-05 | Motor Retroalimentación | RF-016,RF-018 | CU-001 (pasos 6-7) | Evalúa respuesta → puntaje + retroalimentación (< 1s RNF-002) |
| EC-06 | Sistema de Reportes | RF-022,RF-023 | CU-005 | Genera PDF/Excel → sube a S3 → URL firmada (RNF-013 < 5s) |
| EC-07 | Base de Datos | RF-001 a RF-023 | Todos los CU | Recibe CRUD → retorna datos + confirmaciones (RNF-012) |
| EC-08 | Navegador Web | RNF-001,002,009,010 | CU-001 (pasos 1,4,9) | HTTP/HTTPS → HTML/CSS/JS responsivo |
| EC-09 | Institución Educativa | RF-001,RF-002 | CU-002 | Datos institucionales → confirmación + reportes agrupados |
