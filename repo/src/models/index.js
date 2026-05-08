const sequelize = require('../config/database');

const Rol = require('./Rol');
const NivelEducativo = require('./NivelEducativo');
const TipoContenido = require('./TipoContenido');
const TipoActividad = require('./TipoActividad');
const Institucion = require('./Institucion');
const Usuario = require('./Usuario');
const Matricula = require('./Matricula');
const Modulo = require('./Modulo');
const Actividad = require('./Actividad');
const ProgresoEstudiante = require('./ProgresoEstudiante');
const HistorialPractica = require('./HistorialPractica');
const Reporte = require('./Reporte');

// USUARIO ── ROL / NIVEL_EDUCATIVO
Rol.hasMany(Usuario, { foreignKey: 'id_rol' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' });

NivelEducativo.hasMany(Usuario, { foreignKey: 'id_nivel' });
Usuario.belongsTo(NivelEducativo, { foreignKey: 'id_nivel' });

// MATRICULA  (USUARIO ↔ INSTITUCION)
Usuario.hasMany(Matricula, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Matricula.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Institucion.hasMany(Matricula, { foreignKey: 'id_institucion', onDelete: 'CASCADE' });
Matricula.belongsTo(Institucion, { foreignKey: 'id_institucion' });

// MODULO ── TIPO_CONTENIDO / NIVEL / DOCENTE
TipoContenido.hasMany(Modulo, { foreignKey: 'id_tipo_contenido' });
Modulo.belongsTo(TipoContenido, { foreignKey: 'id_tipo_contenido' });

NivelEducativo.hasMany(Modulo, { foreignKey: 'id_nivel' });
Modulo.belongsTo(NivelEducativo, { foreignKey: 'id_nivel' });

Usuario.hasMany(Modulo, { foreignKey: 'id_docente', as: 'modulos_dictados' });
Modulo.belongsTo(Usuario, { foreignKey: 'id_docente', as: 'docente' });

// ACTIVIDAD ── TIPO_ACTIVIDAD / MODULO / DOCENTE
TipoActividad.hasMany(Actividad, { foreignKey: 'id_tipo_actividad' });
Actividad.belongsTo(TipoActividad, { foreignKey: 'id_tipo_actividad' });

Modulo.hasMany(Actividad, { foreignKey: 'id_modulo', onDelete: 'CASCADE' });
Actividad.belongsTo(Modulo, { foreignKey: 'id_modulo' });

Usuario.hasMany(Actividad, { foreignKey: 'id_docente', as: 'actividades_creadas' });
Actividad.belongsTo(Usuario, { foreignKey: 'id_docente', as: 'docente' });

// PROGRESO_ESTUDIANTE ── USUARIO / ACTIVIDAD
Usuario.hasMany(ProgresoEstudiante, { foreignKey: 'id_estudiante' });
ProgresoEstudiante.belongsTo(Usuario, { foreignKey: 'id_estudiante', as: 'estudiante' });

Actividad.hasMany(ProgresoEstudiante, { foreignKey: 'id_actividad' });
ProgresoEstudiante.belongsTo(Actividad, { foreignKey: 'id_actividad' });

// HISTORIAL_PRACTICA ── USUARIO / MODULO
Usuario.hasMany(HistorialPractica, { foreignKey: 'id_estudiante' });
HistorialPractica.belongsTo(Usuario, { foreignKey: 'id_estudiante', as: 'estudiante' });

Modulo.hasMany(HistorialPractica, { foreignKey: 'id_modulo' });
HistorialPractica.belongsTo(Modulo, { foreignKey: 'id_modulo' });

// REPORTE ── USUARIO / INSTITUCION
Usuario.hasMany(Reporte, { foreignKey: 'id_generado_por' });
Reporte.belongsTo(Usuario, { foreignKey: 'id_generado_por', as: 'autor' });

Institucion.hasMany(Reporte, { foreignKey: 'id_institucion' });
Reporte.belongsTo(Institucion, { foreignKey: 'id_institucion' });

module.exports = {
  sequelize,
  Rol,
  NivelEducativo,
  TipoContenido,
  TipoActividad,
  Institucion,
  Usuario,
  Matricula,
  Modulo,
  Actividad,
  ProgresoEstudiante,
  HistorialPractica,
  Reporte,
};
