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
});

const hashIfNeeded = async (user) => {
  if (user.changed('contrasena')) {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    user.contrasena = await bcrypt.hash(user.contrasena, rounds);
  }
};

Usuario.beforeCreate(hashIfNeeded);
Usuario.beforeUpdate(hashIfNeeded);

Usuario.prototype.verificarContrasena = function (plain) {
  return bcrypt.compare(plain, this.contrasena);
};

Usuario.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.contrasena;
  return values;
};

module.exports = Usuario;
