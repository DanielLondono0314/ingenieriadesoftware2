const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Institucion = sequelize.define('institucion', {
  id_institucion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  municipio: { type: DataTypes.STRING(100), allowNull: false },
  tipo: {
    type: DataTypes.STRING(10),
    validate: { isIn: [['publica', 'privada']] },
  },
  niveles_educativos: { type: DataTypes.TEXT },
  contacto: { type: DataTypes.STRING(200) },
});

module.exports = Institucion;
