// RF-001, RF-005 — usuarios de demostración (1 admin, 1 docente, 2 estudiantes).
// Uso: npm run seed   (requiere el DDL aplicado y las 5 filas de ROL).
// Las contraseñas se generan al azar y SOLO se imprimen en consola; no se guardan en archivos.
require('dotenv').config();
const crypto = require('crypto');
const { sequelize, Usuario } = require('../src/models');

const DEMO = [
  { nombre: 'Ana', apellido: 'Admin', correo: 'admin@iak12.demo', id_rol: 3 },
  { nombre: 'Diego', apellido: 'Docente', correo: 'docente@iak12.demo', id_rol: 2 },
  { nombre: 'Elena', apellido: 'Estudiante', correo: 'estudiante1@iak12.demo', id_rol: 1 },
  { nombre: 'Esteban', apellido: 'Estudiante', correo: 'estudiante2@iak12.demo', id_rol: 1 },
];

(async () => {
  try {
    const filas = [];
    for (const d of DEMO) {
      const contrasena = crypto.randomBytes(9).toString('base64url');
      let u = await Usuario.findOne({ where: { correo: d.correo } });
      if (u) { u.contrasena = contrasena; u.estado = 'activo'; await u.save(); } // el hook re-hashea
      else u = await Usuario.create({ ...d, contrasena, estado: 'activo' });
      filas.push({ correo: d.correo, rol: d.id_rol, contrasena });
    }
    console.table(filas);
  } catch (e) {
    console.error('Seed falló:', e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
