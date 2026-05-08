const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('rol', {
  id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      isIn: [['Estudiante', 'Docente', 'Administrador', 'Coordinador', 'Directivo']],
    },
  },
  descripcion: { type: DataTypes.TEXT },
  permisos: { type: DataTypes.JSONB },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

module.exports = Rol;
