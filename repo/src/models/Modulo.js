const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Modulo = sequelize.define('modulo', {
  id_modulo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  id_tipo_contenido: { type: DataTypes.INTEGER, allowNull: false },
  id_nivel: { type: DataTypes.INTEGER, allowNull: false },
  area_curricular: { type: DataTypes.STRING(100) },
  id_docente: { type: DataTypes.INTEGER, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

module.exports = Modulo;
