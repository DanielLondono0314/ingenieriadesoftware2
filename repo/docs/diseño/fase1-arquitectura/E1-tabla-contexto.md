# E1 · Tabla de Contexto

## Descripción
9 entidades externas que interactúan con la Plataforma de Alfabetización en IA para K-12.

## Tabla de Contexto

| ID | Entidad Externa | Tipo | Descripción | RF / RNF Relacionado |
|----|----------------|------|-------------|----------------------|
| EC-01 | Estudiante K-12 | Usuario principal | Alumno K-12 que accede a módulos y actividades interactivas de IA | HU-001 a HU-008 / RF-001,005,011,013,016,017,018 |
| EC-02 | Docente | Usuario principal | Profesor que crea actividades, hace seguimiento y exporta reportes | HU-009 a HU-013 / RF-003,012,014,015,019,022 |
| EC-03 | Administrador | Usuario principal | Gestor total: usuarios, módulos, roles y reportes globales | HU-014 a HU-018 / RF-001,004,006,007,009,021,023 |
| EC-04 | Sistema de Autenticación | Subordinado | Valida credenciales (bcrypt), sesiones y bloqueo por intentos fallidos | RF-005 / RNF-004,005 |
| EC-05 | Motor de Retroalimentación | Subordinado | Evalúa respuestas, calcula puntajes y genera retroalimentación inmediata | RF-016,018 / RNF-002 |
| EC-06 | Sistema de Reportes | Subordinado | Genera y exporta reportes PDF/Excel de progreso académico | RF-022,023 / RNF-013 |
| EC-07 | Base de Datos | Subordinado | Repositorio central 3FN. Almacena todas las entidades del sistema | RF-001 a RF-023 / RNF-012 |
| EC-08 | Navegador Web | Par | Chrome/Firefox/Edge. Renderiza la interfaz responsiva del sistema | RNF-001,002,009,010 |
| EC-09 | Institución Educativa | Par | Entidad educativa externa. Contexto organizacional y reportes agrupados | RF-001 / MER: INSTITUCIÓN |

## Clasificación de Tipos

| Tipo | Descripción |
|------|-------------|
| **Usuario principal** | Persona que interactúa directamente con la interfaz del sistema |
| **Subordinado** | Componente interno que provee servicios al sistema central |
| **Par** | Sistema o entidad externa que se comunica con el sistema en igualdad de condiciones |
