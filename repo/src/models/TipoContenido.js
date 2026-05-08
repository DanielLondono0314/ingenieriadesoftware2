const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoContenido = sequelize.define('tipo_contenido', {
  id_tipo_contenido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_tipo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT },
});

module.exports = TipoContenido;
