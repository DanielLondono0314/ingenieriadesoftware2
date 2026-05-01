# M13 · Prototipo → Wireframes → Interacciones → Pantallas Destino

| Flujo | Pantalla Origen (Wireframe) | Interacción Simulada | Animación | Pantalla Destino |
|-------|---------------------------|----------------------|-----------|-----------------|
| F-01 | SCR-01 Login | Clic INGRESAR con credenciales válidas | Fade-in + slide-up | SCR-04 / SCR-15 / SCR-25 según rol |
| F-02 | SCR-04 Dashboard Est. | Clic en módulo de la lista | Slide-right | SCR-07 Detalle Módulo |
| F-03 | SCR-07 Detalle Módulo | Clic en actividad disponible | Slide-right | SCR-08 Actividad Interactiva |
| F-04 | SCR-08 Actividad | Clic en opción de respuesta | Resaltado < 100ms + retroalim. < 1s | SCR-08 siguiente pregunta o SCR-09 si completa |
| F-05 | SCR-08 Actividad | Finalizar (última pregunta) | Modal confirmación → animación resultado | SCR-09 Resultado Actividad |
| F-06 | SCR-09 Resultado | Clic en "Ver mi progreso" | Fade-in | SCR-10 Mi Progreso |
| F-07 | SCR-15 Dashboard Doc. | Clic en "Seguimiento Grupo" | Fade-in | SCR-19 Seguimiento Grupo |
| F-08 | SCR-19 Seguimiento | Clic en "Exportar Reporte" | Slide-up modal | SCR-21 → Descarga archivo |
| F-09 | SCR-25 Dashboard Admin | Clic en "Gestión Usuarios" | Fade-in | SCR-27 Gestión Usuarios |
| F-10 | SCR-27 Gestión Users | Clic en "+ Nuevo Usuario" | Modal slide-up | SCR-28 Crear/Editar Usuario |
| F-11 | Cualquier pantalla | Clic en "Salir" del sidebar | Fade-out + clear session | SCR-01 Login |
