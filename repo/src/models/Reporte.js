const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reporte = sequelize.define('reporte', {
  id_reporte: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { isIn: [['individual', 'grupal', 'global']] },
  },
  rango: { type: DataTypes.STRING(300), allowNull: false },
  fecha_generacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  id_generado_por: { type: DataTypes.INTEGER, allowNull: false },
  id_institucion: { type: DataTypes.INTEGER },
  formato: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: { isIn: [['PDF', 'Excel']] },
  },
  contenido_url: { type: DataTypes.STRING(500), allowNull: false },
});

module.exports = Reporte;
