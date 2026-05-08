const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgresoEstudiante = sequelize.define(
  'progreso_estudiante',
  {
    id_progreso: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
    id_actividad: { type: DataTypes.INTEGER, allowNull: false },
    puntaje_obtenido: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
    fecha_realizacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'en_progreso',
      validate: { isIn: [['completado', 'en_progreso']] },
    },
    retroalimentacion: { type: DataTypes.JSONB },
  },
  {
    indexes: [{ unique: true, fields: ['id_estudiante', 'id_actividad'] }],
  }
);

module.exports = ProgresoEstudiante;
