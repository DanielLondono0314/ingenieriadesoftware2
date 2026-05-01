# M2 · Arquetipos → CU → RF

| ARQ | Arquetipo | CU Relacionados | RF que lo justifican |
|-----|-----------|----------------|----------------------|
| ARQ-01 | Usuario | CU-001,002,003,004,005 | RF-001,002,003,004,005,006 — CRUD completo + autenticación + roles |
| ARQ-02 | Rol | CU-002 | RF-006 — asignación y gestión de permisos diferenciados |
| ARQ-03 | Institución | CU-002 | RF-001,002 — registro y consulta de instituciones educativas |
| ARQ-04 | Matrícula | CU-002 | RF-001 — vínculo N:M Usuario-Institución (entidad débil) |
| ARQ-05 | NivelEducativo | CU-002,003 | RF-007,008 — categorización K-12 para filtrar contenido |
| ARQ-06 | Módulo | CU-003 | RF-007,008,009,010,011 — CRUD de módulos + visualización interactiva |
| ARQ-07 | TipoContenido | CU-003 | RF-007 — catálogo temático de módulos normalizado 3FN |
| ARQ-08 | Actividad | CU-001,003,004 | RF-012,013,014,015,016 — CRUD y ejecución de actividades |
| ARQ-09 | TipoActividad | CU-003 | RF-012 — catálogo pedagógico normalizado 3FN |
| ARQ-10 | ProgresoEstudiante | CU-001,004 | RF-017,020 — guardado automático del avance por actividad |
| ARQ-11 | HistorialPractica | CU-001,004 | RF-018,019,021 — registro histórico de módulos completados |
| ARQ-12 | Reporte | CU-005 | RF-022,023 — generación y exportación PDF/Excel |
