const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// SCR-13 · DE-01 (ASIGNADA) — avisos por usuario (actividad asignada, módulo
// completado…). Propuesta de la docente incorporada.
const Notificacion = sequelize.define('notificacion', {
  id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING(40), allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  leida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = Notificacion;
