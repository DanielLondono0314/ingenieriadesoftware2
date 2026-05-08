const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Actividad = sequelize.define('actividad', {
  id_actividad: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(200), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  id_tipo_actividad: { type: DataTypes.INTEGER, allowNull: false },
  id_modulo: { type: DataTypes.INTEGER, allowNull: false },
  id_docente: { type: DataTypes.INTEGER, allowNull: false },
  instrucciones: { type: DataTypes.TEXT, allowNull: false },
  criterio_evaluacion: { type: DataTypes.TEXT, allowNull: false },
  puntaje_maximo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = Actividad;
