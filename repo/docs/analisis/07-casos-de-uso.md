# 07 · Casos de Uso

## Tabla Resumen

| ID | Nombre | Actor Principal | RF Cubiertos | Flujos Alt. |
|----|--------|----------------|-------------|-------------|
| CU-001 | Realizar actividad interactiva de IA | Estudiante K-12 | RF-013,016,017,018 / RNF-002,012 | 3 |
| CU-002 | Registrar usuario en el sistema | Administrador | RF-001 / RNF-006,015 | 2 |
| CU-003 | Gestionar módulo educativo | Administrador | RF-007,008,009,010 | 2 |
| CU-004 | Consultar progreso de estudiantes | Docente | RF-019 / RNF-001,002 | 2 |
| CU-005 | Exportar reporte de progreso | Docente / Admin | RF-022,023 / RNF-013 | 3 |

---

## CU-001 · Realizar Actividad Interactiva de IA

**Actor principal:** Estudiante K-12
**RF cubiertos:** RF-013, RF-016, RF-017, RF-018 / RNF-002, RNF-012

### Precondiciones
- El estudiante ha iniciado sesión con token JWT válido (RF-005).
- Existe al menos un módulo activo con actividades asignadas al nivel del estudiante.
- La actividad seleccionada está en estado PUBLICADA o ASIGNADA.

### Flujo Normal

| Paso | Origen | Destino | Descripción |
|------|--------|---------|-------------|
| 1 | Estudiante | Interfaz Web | Selecciona una actividad del módulo disponible |
| 2 | Interfaz Web | ActividadService | Solicita carga de la actividad |
| 3 | ActividadService | BD 3FN | Consulta datos completos de la actividad |
| 4 | Interfaz Web | Estudiante | Muestra actividad con instrucciones y contenido multimedia |
| 5 | Estudiante | Interfaz Web | Envía una respuesta |
| 6 | Interfaz Web | Motor Retroalim. | Evalúa la respuesta y calcula el puntaje parcial |
| 7 | Motor Retroalim. | Interfaz Web | Retorna retroalimentación en **< 1s** (RNF-002) |
| 8 | Interfaz Web | ProgresoService | Guarda el avance automáticamente (RF-017, RNF-012) |
| 9 | Interfaz Web | Estudiante | Muestra retroalimentación y avanza a la siguiente pregunta |
| 10 | ProgresoService | BD 3FN | Al completar: registra en HISTORIAL_PRACTICA (RF-018) |

### Postcondiciones
- El resultado queda registrado en HISTORIAL_PRACTICA (RF-018).
- El PROGRESO_ESTUDIANTE se actualiza automáticamente (RF-017, RF-020).
- El docente puede visualizar el resultado en tiempo real (RF-019).

### Flujos Alternativos
**A1 — Sesión expirada:** Sistema guarda progreso parcial y redirige al login. Al reingresar retoma desde el último punto guardado (HU-008).
**A2 — Respuesta incorrecta:** Muestra retroalimentación y permite reintentar máximo 3 veces por pregunta.
**A3 — Actividad bloqueada:** Muestra mensaje indicando que debe completar actividades previas.

---

## CU-002 · Registrar Usuario en el Sistema

**Actor principal:** Administrador
**RF cubiertos:** RF-001 / RNF-006, RNF-015

### Flujo Normal

| Paso | Origen | Destino | Descripción |
|------|--------|---------|-------------|
| 1 | Administrador | Sistema | Accede a Gestión de Usuarios → + Nuevo Usuario |
| 2 | Sistema | Administrador | Muestra formulario: nombre, apellido, correo, contraseña, rol, nivel |
| 3 | Administrador | Sistema | Completa los campos y hace clic en Guardar |
| 4 | Sistema | Sistema | Valida campos obligatorios (RNF-015) |
| 5 | Sistema | Sistema | Verifica unicidad del correo en BD |
| 6 | Sistema | Sistema | Genera hash bcrypt de la contraseña (RNF-004) |
| 7 | Sistema | Base de datos | Inserta registro en USUARIO |
| 8 | Sistema | Administrador | Muestra confirmación de registro exitoso |

### Flujos Alternativos
**A1 — Campo vacío:** Error en línea. El formulario no se envía hasta corregir (RNF-015).
**A2 — Correo duplicado:** Mensaje de conflicto. El administrador debe ingresar un correo diferente.

---

## CU-003 · Gestionar Módulo Educativo

**Actor principal:** Administrador
**RF cubiertos:** RF-007, RF-008, RF-009, RF-010

### Flujo Normal

| Paso | Origen | Destino | Descripción |
|------|--------|---------|-------------|
| 1 | Administrador | Sistema | Accede a Gestión de Módulos |
| 2 | Sistema | Administrador | Muestra listado con filtros por nivel, tipo y estado |
| 3 | Administrador | Sistema | Clic en + Nuevo Módulo |
| 4 | Sistema | Administrador | Muestra formulario con campos de módulo |
| 5 | Administrador | Sistema | Completa y hace clic en Publicar Módulo |
| 6 | Sistema | Sistema | Valida campos y unicidad del título |
| 7 | Sistema | Base de datos | Inserta en MÓDULO con activo=true |
| 8 | Sistema | Administrador | Confirmación de publicación exitosa |

### Flujos Alternativos
**A1 — Modificar:** Formulario pre-cargado con datos actuales. Guarda cambios (RF-009).
**A2 — Eliminar con historial:** Solo desactivación lógica (activo=false) para conservar el historial de los estudiantes.

---

## CU-004 · Consultar Progreso de Estudiantes

**Actor principal:** Docente
**RF cubiertos:** RF-019 / RNF-001, RNF-002

### Flujo Normal

| Paso | Origen | Destino | Descripción |
|------|--------|---------|-------------|
| 1 | Docente | Sistema | Accede a Seguimiento del Grupo |
| 2 | Sistema | BD | Consulta PROGRESO_ESTUDIANTE e HISTORIAL_PRACTICA |
| 3 | Sistema | Docente | Muestra tabla con puntajes, estados y último acceso |
| 4 | Docente | Sistema | Selecciona un estudiante para ver detalle |
| 5 | Sistema | BD | Consulta historial completo del estudiante |
| 6 | Sistema | Docente | Muestra gráfica de progreso por módulo |
| 7 | Docente | Sistema | [Opcional] Clic en Exportar Reporte |
| 8-10 | Sistema | Sist. Reportes / BD / Docente | Genera, registra y entrega enlace de descarga |

### Flujos Alternativos
**A1 — Sin datos:** Mensaje informativo. Sugiere verificar que las actividades estén publicadas.
**A2 — Filtrar por módulo:** Actualización en tiempo real < 3s (RNF-001).

---

## CU-005 · Exportar Reporte de Progreso

**Actor principal:** Docente / Administrador
**RF cubiertos:** RF-022, RF-023 / RNF-013

### Flujo Normal

| Paso | Origen | Destino | Descripción |
|------|--------|---------|-------------|
| 1 | Doc/Admin | Sistema | Accede a Exportar Reporte |
| 2 | Sistema | Doc/Admin | Formulario: tipo, rango, grupo, formato (PDF/Excel) |
| 3 | Doc/Admin | Sistema | Configura parámetros y hace clic en Generar |
| 4 | Sistema | BD | Consulta PROGRESO_ESTUDIANTE, HISTORIAL y USUARIO |
| 5 | Sistema | Sistema | Calcula promedios, porcentajes y estadísticas |
| 6 | Sistema | Sist. Reportes | Genera archivo en formato seleccionado |
| 7 | Sistema | Storage S3 | Sube el archivo y obtiene URL firmada |
| 8 | Sistema | BD | Registra en REPORTE con tipo, formato, fecha y URL |
| 9 | Sistema | Doc/Admin | Toast con enlace de descarga directa |

### Postcondiciones
- Reporte registrado en REPORTE con metadatos y URL.
- Archivo disponible en S3 para descarga inmediata.
- Tiempo de generación **< 5 segundos** para grupos de hasta 50 estudiantes (RNF-013).

### Flujos Alternativos
**A1 — PDF:** Plantilla institucional con logo, encabezado y tabla de datos.
**A2 — Excel:** XLSX con hoja de datos + hoja de resumen estadístico + gráfica.
**A3 — Grupo > 50 estudiantes:** Procesamiento asíncrono en lotes. Notificación cuando esté listo.

---

## Historias de Usuario

### Rol: Estudiante K-12

| ID | Historia | Beneficio | RF |
|----|----------|-----------|----|
| HU-001 | Como estudiante, quiero registrarme con mis datos básicos | Para acceder a módulos de IA con historial personalizado | RF-001 |
| HU-002 | Como estudiante, quiero iniciar sesión con usuario y contraseña | Para acceder de forma segura a mis actividades | RF-002, RF-005 |
| HU-003 | Como estudiante, quiero explorar módulos de conceptos básicos de IA | Para comprender la IA de manera didáctica | RF-008, RF-011 |
| HU-004 | Como estudiante, quiero realizar actividades interactivas sobre IA | Para aprender haciendo y reforzar conceptos | RF-013, RF-016 |
| HU-005 | Como estudiante, quiero ver mi progreso y resultados | Para evaluar mi avance y saber qué temas reforzar | RF-018, RF-019, RF-020 |
| HU-006 | Como estudiante, quiero recibir retroalimentación inmediata | Para corregir errores en el momento y mejorar | RF-016, RF-018 |
| HU-007 | Como estudiante, quiero ver explicaciones visuales de algoritmos de IA | Para entender conceptos abstractos de forma gráfica | RF-011 |
| HU-008 | Como estudiante, quiero guardar mis actividades y retomarlas después | Para continuar sin perder el avance anterior | RF-017 |

### Rol: Docente

| ID | Historia | Beneficio | RF |
|----|----------|-----------|----|
| HU-009 | Como docente, quiero registrar y gestionar mis estudiantes | Para hacer seguimiento y personalizar la enseñanza | RF-001, RF-002, RF-003 |
| HU-010 | Como docente, quiero crear y asignar actividades sobre IA | Para evaluar comprensión y adaptar el ritmo | RF-012, RF-013 |
| HU-011 | Como docente, quiero visualizar desempeño en tiempo real | Para identificar dificultades y brindar apoyo oportuno | RF-019 |
| HU-012 | Como docente, quiero exportar reportes de progreso | Para llevar registro académico compartible | RF-022 |
| HU-013 | Como docente, quiero modificar o eliminar actividades | Para actualizar contenido según el avance del grupo | RF-014, RF-015 |

### Rol: Administrador

| ID | Historia | Beneficio | RF |
|----|----------|-----------|----|
| HU-014 | Como administrador, quiero registrar nuevos usuarios | Para mantener actualizada la base de usuarios | RF-001 |
| HU-015 | Como administrador, quiero modificar y eliminar usuarios | Para gestionar el acceso y mantener la seguridad | RF-003, RF-004 |
| HU-016 | Como administrador, quiero gestionar módulos y contenidos | Para mantener actualizado el material educativo de IA | RF-007, RF-008, RF-009, RF-010 |
| HU-017 | Como administrador, quiero generar reportes globales | Para evaluar efectividad y tomar decisiones de mejora | RF-021, RF-023 |
| HU-018 | Como administrador, quiero configurar roles y permisos | Para garantizar que cada usuario acceda solo a lo que le corresponde | RF-006 |

---

## Requisitos Funcionales

| ID | Nombre | HU | Entidad | Prior. | CRUD |
|----|--------|----|---------|--------|------|
| RF-001 | Registrar Usuario | HU-001, HU-014 | USUARIO | Alta | C |
| RF-002 | Consultar Usuario | HU-002, HU-014 | USUARIO | Alta | R |
| RF-003 | Modificar Usuario | HU-009, HU-015 | USUARIO | Alta | U |
| RF-004 | Eliminar/Desactivar | HU-015 | USUARIO | Media | D |
| RF-005 | Autenticación | HU-002 | USUARIO | Alta | R |
| RF-006 | Gestión de Roles | HU-018 | ROL | Alta | U |
| RF-007 | Crear Módulo | HU-016 | MÓDULO | Alta | C |
| RF-008 | Consultar Módulos | HU-003, HU-016 | MÓDULO | Alta | R |
| RF-009 | Modificar Módulo | HU-016 | MÓDULO | Media | U |
| RF-010 | Eliminar Módulo | HU-016 | MÓDULO | Baja | D |
| RF-011 | Visualización Interactiva | HU-003, HU-007 | MÓDULO | Alta | R |
| RF-012 | Crear Actividad | HU-010 | ACTIVIDAD | Alta | C |
| RF-013 | Consultar Actividades | HU-004, HU-010 | ACTIVIDAD | Alta | R |
| RF-014 | Modificar Actividad | HU-013 | ACTIVIDAD | Media | U |
| RF-015 | Eliminar Actividad | HU-013 | ACTIVIDAD | Media | D |
| RF-016 | Ejecutar Actividad | HU-004, HU-006 | ACTIVIDAD | Alta | R/U |
| RF-017 | Guardar Progreso | HU-008 | PROGRESO_ESTUDIANTE | Alta | C/U |
| RF-018 | Registrar Resultado | HU-005, HU-006 | HISTORIAL_PRACTICA | Alta | C |
| RF-019 | Consultar Progreso | HU-005, HU-011 | HISTORIAL_PRACTICA | Alta | R |
| RF-020 | Actualizar Progreso | HU-005 | PROGRESO_ESTUDIANTE | Media | U |
| RF-021 | Eliminar Historial | HU-017 | HISTORIAL_PRACTICA | Baja | D |
| RF-022 | Exportar Reporte | HU-012 | REPORTE | Media | R |
| RF-023 | Reporte Global | HU-017 | REPORTE | Media | C/R |

---

## Requisitos No Funcionales

| ID | Categoría | Métrica | Herramienta |
|----|-----------|---------|-------------|
| RNF-001 | Rendimiento | Carga de página < 3 segundos | Chrome DevTools Network |
| RNF-002 | Rendimiento | Retroalimentación < 1 segundo | Chrome DevTools Performance |
| RNF-003 | Disponibilidad | 99% uptime en horario escolar | UptimeRobot |
| RNF-004 | Seguridad | Contraseñas con hash bcrypt, nunca texto plano | Revisión BD + OWASP ZAP |
| RNF-005 | Seguridad | Bloqueo 15 min tras 5 intentos fallidos | Prueba funcional manual |
| RNF-006 | Usabilidad | 80% usuarios completan registro en < 5 min | Prueba con usuarios reales |
| RNF-007 | Usabilidad | SUS score ≥ 70/100 | Cuestionario SUS (10 preguntas) |
| RNF-008 | Escalabilidad | 100 usuarios concurrentes sin degradación | Apache JMeter |
| RNF-009 | Compatibilidad | Chrome, Firefox, Edge (últimas 2 versiones) | Prueba manual en 3 navegadores |
| RNF-010 | Compatibilidad | Responsiva 320px – 1920px | Chrome DevTools modo dispositivo |
| RNF-011 | Mantenibilidad | Cobertura de pruebas ≥ 70% | Jest / JUnit |
| RNF-012 | Persistencia | Progreso guardado automáticamente | Inspección BD + prueba funcional |
| RNF-013 | Exportación | PDF/Excel < 5s para grupos ≤ 50 estudiantes | Cronómetro + DevTools Network |
| RNF-014 | Accesibilidad | WCAG 2.1 nivel AA | Lighthouse ≥ 85 |
| RNF-015 | Integridad | Validación de campos obligatorios antes de guardar | Prueba funcional manual |
