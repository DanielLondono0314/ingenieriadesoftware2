const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Matricula = sequelize.define(
  'matricula',
  {
    id_matricula: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    id_institucion: { type: DataTypes.INTEGER, allowNull: false },
    fecha_matricula: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    indexes: [{ unique: true, fields: ['id_usuario', 'id_institucion'] }],
  }
);

module.exports = Matricula;
