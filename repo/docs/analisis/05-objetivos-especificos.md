# 05 · Objetivos Específicos

## Objetivos Específicos

Cada objetivo específico corresponde a una fase del diseño de software y genera entregables concretos y verificables.

---

### OE-01 · Levantar y documentar requisitos

**Objetivo:** Identificar y documentar los requisitos funcionales y no funcionales del sistema mediante técnicas de elicitación formales, garantizando cobertura completa de las necesidades de los tres roles de usuario.

| Entregables asociados | Resultado |
|----------------------|-----------|
| 18 Historias de Usuario (HU-001 a HU-018) | Necesidades por rol: Estudiante, Docente, Administrador |
| 23 Requisitos Funcionales (RF-001 a RF-023) | Con entidad afectada, prioridad y operación CRUD |
| 15 Requisitos No Funcionales (RNF-001 a RNF-015) | Con métrica medible, evidencia y herramienta de verificación |

> Ver `07-casos-de-uso.md` y `06-tecnicas-elicitacion.md`

---

### OE-02 · Definir la arquitectura del sistema

**Objetivo:** Diseñar la arquitectura del sistema mediante tablas de contexto, diagramas de arquetipos, componentes y despliegue que garanticen escalabilidad, modularidad y seguridad.

| Entregables asociados | Resultado |
|----------------------|-----------|
| E1 Tabla de Contexto | 9 entidades externas clasificadas por tipo |
| E2 Tabla de Interacciones | Flujos de entrada/salida por entidad |
| E3 Diagrama de Contexto Arquitectónico | Sistema central con 9 entidades y flujos de datos |
| E4 Diagrama de Arquetipos | 12 abstracciones en 5 capas semánticas |
| E5 Diagrama de Componentes UML | 7 subsistemas con interfaces y dependencias |
| E6 Diagrama de Despliegue UML | 7 nodos físicos con protocolos justificados por RNF |

> Ver `fase1-arquitectura/`

---

### OE-03 · Diseñar el modelo de datos normalizado a 3FN

**Objetivo:** Diseñar el modelo de datos en tercera forma normal que garantice integridad referencial, elimine redundancias y soporte todos los requisitos funcionales del sistema.

| Entregables asociados | Resultado |
|----------------------|-----------|
| E7 Diccionario de Datos | 12 entidades con atributos y reglas de negocio |
| E8 MER Conceptual | 9 entidades fuertes + 3 débiles + 15 relaciones |
| E9 Modelo Relacional | 12 tablas con tipos SQL, PK y FK |
| E10 Normalización 3FN | 8 cambios documentados 1FN → 2FN → 3FN |
| E11 Script DDL | PostgreSQL 15: tablas, índices, seed data y vista |

> Ver `fase2-datos/`

---

### OE-04 · Modelar el comportamiento del sistema

**Objetivo:** Modelar el comportamiento dinámico del sistema mediante diagramas de clases, secuencia y estados con trazabilidad completa hacia los casos de uso y requisitos funcionales.

| Entregables asociados | Resultado |
|----------------------|-----------|
| E12 Diagrama de Clases | 12 clases con atributos (+/-/#), métodos y relaciones UML |
| E13 Diagramas de Secuencia | DS-01 Login · DS-02 Actividad (CU-001) · DS-03 Reporte |
| E14 Diagrama de Estados | DE-01 ACTIVIDAD · DE-02 PROGRESO · DE-03 USUARIO |

> Ver `fase3-componentes/`

---

### OE-05 · Diseñar la interfaz de usuario

**Objetivo:** Diseñar la interfaz de usuario mediante mapa de navegación, wireframes de baja fidelidad y prototipo interactivo de alta fidelidad que cumplan estándares de usabilidad y accesibilidad WCAG 2.1 nivel AA.

| Entregables asociados | Resultado |
|----------------------|-----------|
| E15 Mapa de Navegación | 35 pantallas en 5 módulos con roles y flujos completos |
| E16 Wireframes Baja Fidelidad | 6 pantallas estructurales con regiones y acciones |
| E17 Prototipo Alta Fidelidad | Paleta 10 colores · Inter · 12 interacciones · 11 flujos |

> Ver `fase4-interfaz/`
