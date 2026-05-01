# 06 · Técnicas de Elicitación de Requisitos

## Descripción General

Para levantar los requisitos del sistema se aplicaron **7 técnicas de elicitación complementarias**. Cada técnica aportó información específica que se refleja en los artefactos del proyecto.

---

## Técnicas Aplicadas

### 1. Entrevistas Semiestructuradas
- **Stakeholders:** Docentes de tecnología e informática, coordinadores académicos
- **Información obtenida:** Necesidades pedagógicas, flujos de trabajo actuales, dolor en el seguimiento de estudiantes, herramientas existentes y sus limitaciones
- **Artefactos generados:** HU-009 a HU-013 (rol Docente), RF-012 a RF-016, RNF-001, RNF-002

### 2. Cuestionarios y Encuestas
- **Stakeholders:** Estudiantes K-12 (grados 6 a 11)
- **Información obtenida:** Hábitos de estudio digital, dispositivos usados, motivación para aprender IA, dificultades con plataformas actuales
- **Artefactos generados:** HU-001 a HU-008 (rol Estudiante), RNF-006, RNF-007, RNF-010

### 3. Análisis de Documentos
- **Stakeholders:** Currículos escolares MEN, estándares UNESCO de IA en educación, plataformas similares (Khan Academy, Code.org)
- **Información obtenida:** Niveles educativos K-12, tipos de contenido IA pertinentes, estructura de módulos y actividades pedagógicas
- **Artefactos generados:** Entidad NIVEL_EDUCATIVO, TIPO_CONTENIDO, TIPO_ACTIVIDAD, módulos temáticos

### 4. Observación Directa
- **Stakeholders:** Clases de tecnología en instituciones educativas
- **Información obtenida:** Interacción real estudiante-docente-herramienta, tiempos de respuesta esperados, contexto de uso en aula
- **Artefactos generados:** RNF-001 (< 3s), RNF-002 (< 1s), RNF-009 (compatibilidad navegadores)

### 5. Análisis de Casos de Uso
- **Stakeholders:** Equipo de desarrollo + docentes
- **Información obtenida:** Flujos completos de interacción usuario-sistema, precondiciones, postcondiciones, flujos alternativos y excepciones
- **Artefactos generados:** CU-001 a CU-005, Diagramas de Secuencia DS-01 a DS-03

### 6. Prototipado Exploratorio
- **Stakeholders:** Docentes y estudiantes piloto
- **Información obtenida:** Validación temprana de la estructura de navegación, disposición de elementos, claridad de las instrucciones
- **Artefactos generados:** SCR-01 a SCR-35, Wireframes E16, Prototipo E17

### 7. Revisión de Protocolos de Seguridad
- **Stakeholders:** Administradores de sistemas institucionales
- **Información obtenida:** Requisitos de autenticación, políticas de contraseñas, manejo de intentos fallidos, logs de seguridad
- **Artefactos generados:** RNF-004, RNF-005, RF-005, RF-006

---

## Tabla Resumen

| # | Técnica | Stakeholders | RF/RNF generados | HU generadas |
|---|---------|-------------|-----------------|--------------|
| 1 | Entrevistas semiestructuradas | Docentes, coordinadores | RF-012 a RF-016, RNF-001, RNF-002 | HU-009 a HU-013 |
| 2 | Cuestionarios y encuestas | Estudiantes K-12 | RNF-006, RNF-007, RNF-010 | HU-001 a HU-008 |
| 3 | Análisis de documentos | MEN, UNESCO, Khan Academy | RF-007, RF-008, RF-012 | — |
| 4 | Observación directa | Aula de clase | RNF-001, RNF-002, RNF-009 | — |
| 5 | Análisis de casos de uso | Dev + docentes | RF-013, RF-016, RF-017, RF-018 | HU-014 a HU-018 |
| 6 | Prototipado exploratorio | Docentes + estudiantes piloto | RNF-006, RNF-007, RNF-010 | — |
| 7 | Revisión protocolos seguridad | Admins de sistemas | RNF-004, RNF-005, RF-005, RF-006 | — |
