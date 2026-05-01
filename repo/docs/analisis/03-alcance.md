# 03 · Alcance del Sistema

## 3.1 Alcance Funcional — Lo que SÍ incluye

| Área | Descripción |
|------|-------------|
| **Gestión de usuarios** | Registro, autenticación, modificación y desactivación de Estudiantes K-12, Docentes y Administradores. Matrícula en instituciones educativas. |
| **Gestión de contenidos** | Creación, consulta, modificación y eliminación de módulos educativos sobre IA, organizados por nivel educativo (K-12) y tipo de contenido (Fundamentos, Ética, Programación, Robótica). |
| **Actividades interactivas** | Creación y asignación de actividades pedagógicas (cuestionarios, simulaciones, ejercicios, debates). Ejecución con retroalimentación inmediata (< 1s) y guardado automático del progreso. |
| **Seguimiento del aprendizaje** | Registro automático del progreso por actividad (PROGRESO_ESTUDIANTE) e historial por módulo (HISTORIAL_PRACTICA). Consulta en tiempo real por docentes. |
| **Reportes y exportación** | Generación de reportes individuales, grupales y globales en PDF o Excel. Descarga desde almacenamiento en nube (S3). Máximo 5 segundos para grupos de hasta 50 estudiantes. |
| **Seguridad** | Autenticación con hash bcrypt, bloqueo automático tras 5 intentos fallidos, log de seguridad, control de acceso por rol. |
| **Accesibilidad y compatibilidad** | Interfaz responsiva (320px – 1920px), compatible con Chrome, Firefox y Edge. Cumple WCAG 2.1 nivel AA. |

---

## 3.2 Alcance No Funcional — Lo que NO incluye

| Exclusión | Justificación |
|-----------|---------------|
| Videollamadas o comunicación en tiempo real | Existen plataformas especializadas (Zoom, Teams). Fuera del alcance pedagógico definido. |
| Pagos o transacciones financieras | El sistema es de uso institucional gratuito. No requiere módulo de cobros. |
| Integración con Moodle, Google Classroom o LMS externos | Se diseña como sistema independiente para garantizar control total sobre datos y experiencia. |
| Generación automática de contenido con IA generativa | El contenido es creado por docentes certificados para garantizar calidad pedagógica. |
| Aplicación móvil nativa (Android/iOS) | El diseño responsivo cubre dispositivos móviles sin necesidad de app nativa en esta versión. |
| Autenticación biométrica o con redes sociales | Se usa autenticación por correo y contraseña con bcrypt para máxima seguridad institucional. |

---

## 3.3 Niveles Educativos Cubiertos (K-12)

| Código NIE | Nombre del Nivel | Rango de Grados |
|------------|-----------------|-----------------|
| NIE-001 | Primaria Baja | K – 2 |
| NIE-002 | Primaria Alta | 3 – 5 |
| NIE-003 | Secundaria | 6 – 8 |
| NIE-004 | Media | 9 – 12 |

---

## 3.4 Módulos Temáticos de IA

| Tipo de Contenido | Descripción |
|-------------------|-------------|
| Fundamentos de IA | Qué es la IA, historia, conceptos básicos, tipos |
| Ética en IA | Privacidad, sesgos, responsabilidad, impacto social |
| Programación en IA | Algoritmos básicos, lógica computacional, pseudocódigo |
| Robótica | Aplicaciones físicas de la IA, sensores, actuadores |
