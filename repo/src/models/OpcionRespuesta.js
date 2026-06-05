const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// RF-012 | E8-OPCION_RESPUESTA · E16-Wireframes — cada pregunta ofrece opciones
// y las marcadas como correctas reemplazan al criterio en texto libre,
// habilitando la evaluación automática (CU-001 paso 6).
const OpcionRespuesta = sequelize.define('opcion_respuesta', {
  id_opcion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pregunta: { type: DataTypes.INTEGER, allowNull: false },
  texto: { type: DataTypes.TEXT, allowNull: false },
  es_correcta: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

module.exports = OpcionRespuesta;
