# M10 · Diagramas de Secuencia → CU → Clases → Flujos Alternativos

| DS | Nombre | CU | Clases Participantes | Flujos Alternativos Modelados |
|----|--------|-----|----------------------|-------------------------------|
| DS-01 | Iniciar Sesión | CU-001 (auth), CU-002 | Usuario, AuthService, BD Usuarios, Log Seguridad | A1: Credenciales inválidas (contador intentos). A2: Bloqueo 15 min tras 5 intentos + registro en log (RNF-005). |
| DS-02 | Ejecutar Actividad Interactiva | CU-001 | Actividad, Motor Retroalim., ProgresoEstudiante, HistorialPractica | A1: Sesión expirada → guarda parcial + redirige. A2: Respuesta incorrecta → retroalim. + reintento (máx.3). A3: Completa → registra historial. |
| DS-03 | Generar y Exportar Reporte | CU-005 | Reporte, BD 3FN, Exportador PDF/Excel, Storage S3 | A1: Formato PDF → plantilla institucional. A2: Formato Excel → con gráfica. A3: > 50 estudiantes → procesamiento asíncrono + notificación. |
