const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// CU-001 paso 5/A2 | RF-016 | E8-PREGUNTA · E12 — una ACTIVIDAD se compone de
// preguntas evaluables; cada una admite reintentos (max_intentos, CU-001 A2).
const Pregunta = sequelize.define('pregunta', {
  id_pregunta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_actividad: { type: DataTypes.INTEGER, allowNull: false },
  enunciado: { type: DataTypes.TEXT, allowNull: false },
  orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  puntaje: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 1 },
  max_intentos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3, validate: { min: 1 } },
  retroalimentacion: { type: DataTypes.TEXT },
});

module.exports = Pregunta;
