# Guion de Exposición — Backend IA-K12

Secuencia de requests para demostrar el módulo en vivo. **Base URL:** `http://localhost:3000`

> En Thunder Client (versión gratuita): crea cada request a mano → escribe el método y la URL →
> para POST/PUT abre la pestaña **Body → JSON** y pega el cuerpo indicado.
> Ejecuta **en orden**: con la BD recién creada desde el DDL, los IDs salen como aquí se indica.

## Preparación (antes de exponer)

```powershell
# 1. Base de datos limpia desde el DDL (PowerShell)
$env:PGPASSWORD="admin"; $bin="C:\Program Files\PostgreSQL\18\bin"
& "$bin\dropdb.exe" -U postgres -h localhost --if-exists ia_k12
& "$bin\createdb.exe" -U postgres -h localhost ia_k12
$env:PGCLIENTENCODING="UTF8"
& "$bin\psql.exe" -U postgres -h localhost -d ia_k12 -f "docs\diseño\fase2-datos\E11-script-DDL.sql"

# 2. Levantar el servidor
npm run dev
```

---

## BLOQUE 1 — El servidor responde y hay datos maestros

### 1.1 Health check
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/health`
- **Body:** _(ninguno)_
- **Esperado:** `200` → `{ "status": "ok", "db": "connected" }`
- **Qué demuestra:** el API está vivo y conectado a PostgreSQL.

### 1.2 Roles (datos semilla del DDL)
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/roles`
- **Esperado:** `200` → 5 roles (Estudiante, Docente, Administrador, Coordinador, Directivo).
- **Qué demuestra:** los seeds del DDL (E11) se cargaron. Tabla maestra.

### 1.3 Niveles educativos
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/niveles-educativos`
- **Esperado:** `200` → 4 niveles.

---

## BLOQUE 2 — CRUD: crear datos base (relaciones entre entidades)

### 2.1 Crear usuario ESTUDIANTE → será `id_usuario: 1`
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/usuarios`
- **Body:**
```json
{
  "nombre": "Ana",
  "apellido": "Gomez",
  "correo": "ana@colegio.edu.co",
  "contrasena": "secreto123",
  "id_rol": 1,
  "id_nivel": 1
}
```
- **Esperado:** `201`. **La respuesta NO trae `contrasena`** y `estado` es `"activo"`.
- **Qué demuestra:** hash de contraseña con bcrypt (RNF-004) y estado inicial del ciclo de vida (E14-DE03).

### 2.2 Crear usuario DOCENTE → será `id_usuario: 2`
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/usuarios`
- **Body:**
```json
{
  "nombre": "Luis",
  "apellido": "Paez",
  "correo": "luis@colegio.edu.co",
  "contrasena": "clave123",
  "id_rol": 2
}
```
- **Esperado:** `201`.

### 2.3 Crear INSTITUCION → será `id_institucion: 1`
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/instituciones`
- **Body:**
```json
{
  "nombre": "Colegio San Jose",
  "municipio": "Medellin",
  "tipo": "Oficial"
}
```
- **Esperado:** `201`.

### 2.4 Crear MODULO → será `id_modulo: 1`
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/modulos`
- **Body:**
```json
{
  "titulo": "Intro a IA",
  "descripcion": "Conceptos basicos de inteligencia artificial",
  "id_tipo_contenido": 1,
  "id_nivel": 1,
  "id_docente": 2,
  "activo": true
}
```
- **Esperado:** `201`.
- **Qué demuestra:** FK hacia tipo_contenido, nivel y docente (usuario). Relación entre entidades.

### 2.5 Crear ACTIVIDAD → será `id_actividad: 1` (`puntaje_maximo: 100`)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/actividades`
- **Body:**
```json
{
  "titulo": "Quiz IA",
  "descripcion": "Quiz inicial del modulo",
  "id_tipo_actividad": 1,
  "id_modulo": 1,
  "id_docente": 2,
  "instrucciones": "Responde las preguntas",
  "criterio_evaluacion": "Numero de respuestas correctas",
  "puntaje_maximo": 100
}
```
- **Esperado:** `201`.

### 2.6 Crear PROGRESO → será `id_progreso: 1` (`estado: "en_progreso"`)
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/progresos`
- **Body:**
```json
{
  "id_estudiante": 1,
  "id_actividad": 1
}
```
- **Esperado:** `201`, `estado: "en_progreso"`.

### 2.7 (Opcional) Ver relaciones cargadas
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/modulos`
- **Esperado:** el módulo trae anidados su `tipo_contenido`, `nivel_educativo` y `docente`.
- **Qué demuestra:** las asociaciones ORM (E9-E10) con `include`.

---

## BLOQUE 3 — Regla de negocio #1: Completar actividad (E12 · E14-DE02)

> Demuestra la **transición de estados** del progreso y validaciones de negocio.

### 3.1 Intentar completar con puntaje inválido → **422**
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/progresos/1/completar`
- **Body:**
```json
{ "puntaje": 999 }
```
- **Esperado:** `422` → "El puntaje debe estar entre 0 y 100...".
- **Qué demuestra:** el puntaje no puede superar el `puntaje_maximo` de la actividad.

### 3.2 Completar correctamente → **200**
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/progresos/1/completar`
- **Body:**
```json
{ "puntaje": 85 }
```
- **Esperado:** `200` → `estado: "completado"`, `puntaje_obtenido: 85`.
- **Qué demuestra:** transición `en_progreso → completado` (E14-DE02).

### 3.3 Intentar re-completar → **409**
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/progresos/1/completar`
- **Body:**
```json
{ "puntaje": 50 }
```
- **Esperado:** `409` → "El progreso ya está completado; no admite re-completarse".
- **Qué demuestra:** no se permiten transiciones inválidas desde un estado final.

---

## BLOQUE 4 — Regla de negocio #2: Soft-delete de usuario (E12 · E14-DE03)

> Demuestra la **desactivación lógica** y que el **historial académico nunca se borra**.

### 4.1 Crear usuario desechable → será `id_usuario: 3`
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/usuarios`
- **Body:**
```json
{
  "nombre": "Test",
  "apellido": "Borrar",
  "correo": "test@colegio.edu.co",
  "contrasena": "x12345",
  "id_rol": 1
}
```
- **Esperado:** `201`, `estado: "activo"`.

### 4.2 Desactivar (DELETE lógico) → **200**
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/usuarios/3`
- **Body:** _(ninguno)_
- **Esperado:** `200` → `estado: "inactivo"` (no se borra físicamente).

### 4.3 Listar usuarios → el inactivo NO aparece
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/usuarios`
- **Esperado:** el `id 3` ya no está en la lista.
- **Qué demuestra:** el listado filtra los estados `inactivo` / `eliminado_logico`.

### 4.4 Consultar el inactivo por id → sigue accesible
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/usuarios/3`
- **Esperado:** `200` → `estado: "inactivo"`.
- **Qué demuestra:** el dato se conserva (acceso administrativo), solo se oculta del listado.

### 4.5 Desactivar de nuevo → **409**
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/usuarios/3`
- **Esperado:** `409` → "El usuario ya está 'inactivo'...".

### 4.6 PRUEBA CLAVE — desactivar a Ana (que tiene historial)
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/usuarios/1`
- **Esperado:** `200` → `estado: "inactivo"`.

### 4.7 Verificar que el historial de Ana se conservó
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/progresos/1`
- **Esperado:** `200` → el progreso sigue `completado` con puntaje `85`, `id_estudiante: 1`.
- **Qué demuestra:** la regla clave de E14-DE03 → **"el historial académico NUNCA se borra"**.

---

## Cierre de la exposición (resumen para decir)

| Lo que mostré | Artefacto de diseño |
|---|---|
| API conectada a PostgreSQL creada desde el DDL | E11 |
| 12 entidades con relaciones FK (include ORM) | E9-E10 |
| CRUD de maestras y transaccionales | E13 |
| Contraseña hasheada y oculta en la respuesta | RNF-004 |
| Regla 1: transición de estados del progreso | E12 · E14-DE02 |
| Regla 2: soft-delete que conserva el historial | E12 · E14-DE03 |
| Trazabilidad: cada método comentado con `// CU | RF | E..` | E12 / E13 / E14 |
