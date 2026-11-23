# Verificación de RNF — ISO/IEC 25010
Fecha: 2026-11-23 · Código: commit `aed1166`. Herramientas: Lighthouse 13.6.0, axe-core, Playwright (Chromium), autocannon (JMeter no disponible en el entorno), sonda propia de disponibilidad, Jest + Supertest.

| RNF | Característica | Criterio | Herramienta y método | Resultado medido | Estado |
|---|---|---|---|---|---|
| RNF-001 | Eficiencia – comportamiento temporal | Página carga en < 3 s | Lighthouse 13.6 (Chrome headless 153, perfil móvil con limitación simulada), 3 corridas sobre la pantalla de entrada (SCR-01) | LCP 1.7, 2.1 y 1.8 s; FCP 1.7–1.8 s; TBT 0 ms; Rendimiento 98–99/100 | Cumple |
| RNF-002 | Eficiencia – comportamiento temporal | Actividad responde en < 1 s | Playwright (Chromium) con sesión de estudiante: tiempos medidos en el navegador | Carga de la actividad 46 ms; retroalimentación al elegir opción 0.4 ms; finalizar y evaluar en servidor 129 ms | Cumple |
| RNF-003 | Fiabilidad – disponibilidad | 99 % en horario escolar | Sonda propia sobre /api/health cada 5 s durante 10 min (UptimeRobot no disponible sin internet) | 120/120 respuestas 200 (100 %); máximo 264 ms. Muestra de 10 min: el criterio exige 30 días con monitoreo | Parcial |
| RNF-004 | Seguridad – confidencialidad | Contraseñas con hash bcrypt | Inspección de la tabla usuario + login real | Hash $2a$12$ en la BD; la API no devuelve la contraseña; login válido devuelve JWT | Cumple |
| RNF-005 | Seguridad – autenticidad | Bloqueo 15 min tras 5 intentos | Prueba HTTP: 5 intentos fallidos y luego clave correcta | Intentos 1-4: 401; intento 5: 423; con clave correcta mientras está bloqueado: 423 | Cumple |
| RNF-006 | Usabilidad – aprendizaje | 80 % completa el registro sin ayuda | Prueba de usabilidad con usuarios (protocolo en 14.3) | Sin ejecutar: requiere participantes reales | Pendiente |
| RNF-007 | Usabilidad – satisfacción | SUS ≥ 70/100 | Cuestionario SUS de 10 ítems (instrumento en 14.3) | Sin ejecutar: requiere al menos 5 participantes reales | Pendiente |
| RNF-008 | Eficiencia – capacidad | 100 usuarios concurrentes | autocannon (JMeter no pudo instalarse en el entorno): 100 conexiones, 10 s, con token de estudiante | GET /api/modulos: 9 858 peticiones, 0 errores, p99 188 ms. GET /api/actividades/1/preguntas: 13 083 peticiones, 0 errores, p99 138 ms | Cumple |
| RNF-009 | Compatibilidad – coexistencia | Chrome, Firefox y Edge | Playwright con Chromium (motor común de Chrome y Edge); Firefox y WebKit no instalados | Flujos completos sin errores en Chromium; Firefox sin probar | Parcial |
| RNF-010 | Compatibilidad – adaptabilidad | Responsiva de 320 a 1920 px | Playwright: ancho de documento frente al viewport | 320, 768 y 1920 px: scrollWidth = ancho del viewport (sin desborde horizontal) | Cumple |
| RNF-011 | Mantenibilidad – facilidad de prueba | Cobertura ≥ 70 % | Jest + Supertest con --coverage (54 pruebas) | 54/54 aprobadas; sentencias 98.55 %, ramas 88.9 %, funciones 100 % | Cumple |
| RNF-012 | Fiabilidad – tolerancia a fallos | Progreso guardado al completar | Prueba E2E: completar actividad y volver a consultar | Estado completado y puntaje persisten; no hay autoguardado por pregunta | Parcial |
| RNF-013 | Eficiencia – comportamiento temporal | Exportar PDF/Excel en < 5 s | POST /api/reportes/generar, 3 corridas por formato | PDF 26, 16, 13 ms; Excel 31, 17, 8 ms (archivo real generado) | Cumple |
| RNF-014 | Usabilidad – accesibilidad | WCAG 2.1 AA, 0 errores | Lighthouse (Accesibilidad) + axe-core con etiquetas wcag2a/2aa/21a/21aa sobre 5 pantallas | Lighthouse 91/100. axe: color-contrast (2 a 22 elementos según pantalla) y aria-hidden-focus (2) en todas; select-name (2) en Explorar | No cumple |
| RNF-015 | Fiabilidad – integridad de datos | Valida campos obligatorios | Pruebas Jest de validación (400/409/422) | Rechaza campos faltantes y violaciones de CHECK/UNIQUE con mensaje | Cumple |

## Cómo reproducir
- Rendimiento y accesibilidad: `npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility`.
- Concurrencia (RNF-008): `npx autocannon -c 100 -d 10 -H "Authorization=Bearer <token>" http://localhost:3000/api/modulos`.
- Pruebas: `npm test` (Jest + Supertest, cobertura en `coverage/`).

## Protocolo pendiente: RNF-006 y RNF-007 (requiere personas)
1. Reclutar al menos 5 participantes (estudiantes o docentes) que no hayan visto la herramienta.
2. Tarea de onboarding sin ayuda: registrarse (SCR-02) y completar una actividad. RNF-006: éxito si lo logra el 80 %.
3. Cada participante responde el SUS (10 ítems, escala 1–5): 1 Usaría el sistema con frecuencia · 2 Lo encontré innecesariamente complejo · 3 Fue fácil de usar · 4 Necesitaría apoyo técnico · 5 Las funciones están bien integradas · 6 Hay demasiada inconsistencia · 7 La mayoría aprendería a usarlo rápido · 8 Es muy incómodo de usar · 9 Me sentí seguro usándolo · 10 Necesité aprender mucho antes de usarlo.
4. Puntaje por participante = ((suma de ítems impares − 5) + (25 − suma de ítems pares)) × 2.5; RNF-007 se cumple si el promedio es ≥ 70.
5. Registrar resultados reales (no estimados) en esta tabla.
