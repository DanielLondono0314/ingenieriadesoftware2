# E2 · Tabla de Interacciones

## Descripción
Flujos de comunicación bidireccionales entre las entidades externas y el sistema central.

## Tabla de Interacciones

| ID | Entidad | Envía al Sistema | Recibe del Sistema | RF/RNF |
|----|---------|-----------------|-------------------|--------|
| EC-01 | Estudiante K-12 | Registro, credenciales, respuestas a actividades | Acceso, módulos, retroalimentación, historial de progreso | RF-001,005,016,018,019 |
| EC-02 | Docente | Credenciales, nuevas actividades, solicitudes de reporte | Panel docente, confirmaciones, reportes PDF/Excel | RF-012,014,019,022 |
| EC-03 | Administrador | Usuarios nuevos, módulos, configuración de roles | Confirmaciones de gestión, reportes globales | RF-001,006,007,023 |
| EC-04 | Sist. Autenticación | Hash bcrypt, contador de intentos, token de sesión | Validación de acceso, bloqueo 15 min, estado de sesión | RF-005 / RNF-004,005 |
| EC-05 | Motor Retroalim. | Respuesta del estudiante, criterio de evaluación | Retroalimentación inmediata, puntaje parcial y total | RF-016,018 / RNF-002 |
| EC-06 | Sist. Reportes | Solicitud de reporte + parámetros + formato | Archivo PDF/Excel con datos de progreso | RF-022,023 / RNF-013 |
| EC-07 | Base de Datos | Consultas y operaciones CRUD | Datos consultados, confirmación de escritura | RF-001 a RF-023 / RNF-012 |
| EC-08 | Navegador Web | Solicitudes HTTP, eventos de interacción del usuario | Páginas HTML/CSS/JS, respuestas JSON | RNF-001,002,009,010 |
| EC-09 | Institución Educativa | Datos institucionales, solicitudes de matrícula | Confirmación de registro, reportes agrupados | RF-001 / MER: INSTITUCIÓN |
