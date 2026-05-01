# M3 · Componentes/Módulos → Arquetipos → RF → Interfaces

| SUB | Subsistema | Arquetipos | RF Cubiertos | Interfaces Expuestas |
|-----|-----------|-----------|-------------|----------------------|
| SUB-01 | Gestión de Usuarios | ARQ-01,02,03,04 | RF-001 a RF-006 | IRegistro, IAuth, IRoles, IInstitucion |
| SUB-02 | Gestión de Contenidos | ARQ-05,06,07 | RF-007 a RF-011 | IModulo, ITipoContenido, INivel |
| SUB-03 | Gestión de Actividades | ARQ-08,09 + Motor | RF-012 a RF-016 | IActividad, ITipoActividad, IRetroalimentacion |
| SUB-04 | Seguimiento y Progreso | ARQ-10,11 | RF-017 a RF-021 | IProgreso, IHistorial, IEstado |
| SUB-05 | Reportes y Exportación | ARQ-12 + Dashboard | RF-022,023 | IReporte, IExportacion, IDashboard |
| SUB-06 | Infraestructura / BD | Repositorios 3FN | Todos los RF | IRepositorio (CRUD genérico) |
| SUB-07 | Interfaz de Usuario | Portales + Paneles | RNF-009,010,014 | IUI, INavegacion |
