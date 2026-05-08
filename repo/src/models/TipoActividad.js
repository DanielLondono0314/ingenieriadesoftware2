const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoActividad = sequelize.define('tipo_actividad', {
  id_tipo_actividad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_tipo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT },
});

module.exports = TipoActividad;
