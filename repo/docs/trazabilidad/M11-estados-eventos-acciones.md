# M11 · Estados → Eventos → Acciones → RF / Reglas de Negocio

| Entidad / Estado | Evento Disparador | Acción Resultante | RF / RNF | Regla de Negocio |
|-----------------|------------------|------------------|----------|------------------|
| ACTIVIDAD: BORRADOR → PUBLICADA | publicar() | activo=true. Visible en catálogo del nivel. | RF-007,012 | Solo admin/docente puede publicar. Valida campos obligatorios. |
| ACTIVIDAD: PUBLICADA → ARCHIVADA | archivar() | activo=false. Conserva historial. | RF-010,015 | Si tiene historial: solo desactivación lógica. No eliminación física. |
| ACTIVIDAD: ASIGNADA → EN EJECUCIÓN | estudianteInicia() | Crea PROGRESO_ESTUDIANTE estado=en_progreso. | RF-016,017 | UNIQUE(est,act). Un registro por estudiante/actividad. |
| ACTIVIDAD: EN EJECUCIÓN → COMPLETADA | estudianteCompleta() | estado=completado. Registra HISTORIAL_PRACTICA. | RF-018,020 | Calcula puntaje_total. Evalúa modulo_aprobado. |
| PROGRESO: NO INICIADO → EN PROGRESO | iniciarActividad() | fecha_realizacion=NOW(). puntaje=0. | RF-016,017 | Guardado automático sin acción del estudiante (RNF-012). |
| PROGRESO: EN PROGRESO → PAUSADO | inactividad > 30 min | Guarda avance parcial en BD. Sesión expirada. | RF-017, CU-001 A1 | Al reingresar: restaura desde último punto guardado (HU-008). |
| PROGRESO: COMPLETADO → REPASO | revisarActividad() | Solo lectura. Muestra respuestas y retroalimentación. | RF-019 | No se puede modificar el puntaje en modo repaso. |
| USUARIO: ACTIVO → BLOQUEADO | 5 intentos fallidos login | Bloqueo 15 min. Evento en log de seguridad. | RNF-005 | Bloqueo automático. El admin puede desbloquear manualmente. |
| USUARIO: ACTIVO → INACTIVO | desactivar() por admin | activo=false via ROL. Conserva historial. | RF-004 | El historial académico nunca se borra al desactivar un usuario. |
| USUARIO: INACTIVO → ELIMINADO LÓGICO | eliminar() por admin | Anonimiza datos personales. Conserva historial. | RF-004 | Solo eliminación lógica. Historial académico permanece intacto. |
