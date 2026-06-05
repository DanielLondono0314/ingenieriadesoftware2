const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Usuario = sequelize.define('usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  contrasena: { type: DataTypes.STRING(255), allowNull: false },
  id_rol: { type: DataTypes.INTEGER, allowNull: false },
  id_nivel: { type: DataTypes.INTEGER },
  fecha_registro: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  // E14-DE03 — ciclo de vida del usuario
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'activo',
    validate: {
      isIn: [['pendiente', 'activo', 'bloqueado_temporal', 'inactivo', 'eliminado_logico']],
    },
  },
});

const hashIfNeeded = async (user) => {
  if (user.changed('contrasena')) {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    user.contrasena = await bcrypt.hash(user.contrasena, rounds);
  }
};

// CU-001/CU-002 | RF-004 | RNF-004 | E12-Usuario.registrar() — nunca se guarda texto plano
Usuario.beforeCreate(hashIfNeeded);
Usuario.beforeUpdate(hashIfNeeded);

// CU-001 | RF-005 | E12-Usuario.autenticar(pwd): bool · E13-Login
Usuario.prototype.verificarContrasena = function (plain) {
  return bcrypt.compare(plain, this.contrasena);
};

Usuario.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.contrasena;
  return values;
};

module.exports = Usuario;
