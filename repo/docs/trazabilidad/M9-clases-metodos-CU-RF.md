# M9 · Clases → Métodos → CU → RF

| Clase | Métodos Clave | CU donde aparece | RF que origina el método |
|-------|--------------|-----------------|--------------------------|
| Usuario | registrar(), autenticar(pwd), actualizarDatos(), desactivar() | CU-002, CU-001 (auth) | RF-001 (registrar), RF-005 (autenticar), RF-003 (actualizar), RF-004 (desactivar) |
| Rol | getNombreRol(), isActivo(), actualizarPermisos() | CU-002 | RF-006 — gestión de roles y permisos diferenciados |
| NivelEducativo | getCodigo(), getNombre() | CU-002, CU-003 | RF-007 (asignar nivel a módulo), RF-008 (filtrar por nivel) |
| Modulo | crear(), consultar(), modificar(), eliminar(), getActividades() | CU-003 | RF-007 (crear), RF-008 (consultar), RF-009 (modificar), RF-010 (eliminar) |
| Actividad | crear(), ejecutar(est), evaluar(resp), generarRetroalimentacion() | CU-001, CU-003 | RF-012 (crear), RF-016 (ejecutar+evaluar), RF-018 (retroalimentación) |
| ProgresoEstudiante | guardarAvance(), completar(), getPuntaje(), getEstado() | CU-001 (pasos 8,9) | RF-017 (guardarAvance), RF-018 (completar), RF-020 (getEstado) |
| HistorialPractica | registrar(), calcularTiempoEmpleado(), isAprobado() | CU-001 (paso 10), CU-004 | RF-018 (registrar), RF-019 (consultar), RF-021 (eliminar) |
| Reporte | generar(), exportarPDF(), exportarExcel(), getUrl() | CU-005 | RF-022 (exportarPDF/Excel docente), RF-023 (generar global admin) |
