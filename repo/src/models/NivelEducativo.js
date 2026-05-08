const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NivelEducativo = sequelize.define('nivel_educativo', {
  id_nivel: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo_nie: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre_nivel: { type: DataTypes.STRING(100), allowNull: false },
  rango_grado: { type: DataTypes.STRING(20), allowNull: false },
});

module.exports = NivelEducativo;
