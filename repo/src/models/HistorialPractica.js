const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialPractica = sequelize.define('historial_practica', {
  id_historial: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
  id_modulo: { type: DataTypes.INTEGER, allowNull: false },
  fecha_inicio: { type: DataTypes.DATE, allowNull: false },
  fecha_fin: { type: DataTypes.DATE, allowNull: false },
  puntaje_total: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
  actividades_completadas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  modulo_aprobado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

module.exports = HistorialPractica;
