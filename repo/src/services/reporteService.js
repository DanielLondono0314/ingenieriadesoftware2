const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Reporte, ProgresoEstudiante, Usuario, Actividad } = require('../models');
const { BusinessRuleError } = require('../errors/AppError');

// CU-005 | RF-022, RF-023 | RNF-013 | E12-Reporte.generar()/exportar() · E13-Reporte
//
// Genera el archivo real (PDF o Excel) con el progreso de los estudiantes y registra
// el REPORTE con la ruta del archivo en contenido_url.
const DIR = process.env.REPORTES_DIR || path.join(__dirname, '..', '..', 'reportes');

async function generarReporte({ tipo, rango, formato, id_generado_por, id_institucion, id_estudiante }) {
  if (!['individual', 'grupal', 'global'].includes(tipo)) throw new BusinessRuleError("tipo debe ser 'individual', 'grupal' o 'global'");
  if (!['PDF', 'Excel'].includes(formato)) throw new BusinessRuleError("formato debe ser 'PDF' o 'Excel'");
  if (!rango || !id_generado_por) throw new BusinessRuleError('rango e id_generado_por son obligatorios');
  if (tipo === 'individual' && !id_estudiante) throw new BusinessRuleError('El reporte individual requiere id_estudiante');

  const where = tipo === 'individual' ? { id_estudiante } : {};
  const progresos = await ProgresoEstudiante.findAll({
    where,
    include: [{ model: Usuario, as: 'estudiante' }, { model: Actividad }],
    order: [['id_progreso', 'ASC']],
  });
  const filas = progresos.map((p) => [
    `${p.estudiante.nombre} ${p.estudiante.apellido}`,
    p.actividad.titulo,
    Number(p.puntaje_obtenido),
    p.estado,
    new Date(p.fecha_realizacion).toISOString().slice(0, 10),
  ]);
  const cabecera = ['Estudiante', 'Actividad', 'Puntaje', 'Estado', 'Fecha'];

  fs.mkdirSync(DIR, { recursive: true });
  const nombre = `reporte-${tipo}-${Date.now()}.${formato === 'PDF' ? 'pdf' : 'xlsx'}`;
  const ruta = path.join(DIR, nombre);

  if (formato === 'Excel') {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Progreso');
    ws.addRow(cabecera).font = { bold: true };
    filas.forEach((f) => ws.addRow(f));
    await wb.xlsx.writeFile(ruta);
  } else {
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const out = fs.createWriteStream(ruta);
      out.on('finish', resolve);
      out.on('error', reject);
      doc.pipe(out);
      doc.fontSize(16).text(`Reporte de progreso (${tipo})`);
      doc.fontSize(10).text(`Rango: ${rango}`).moveDown();
      doc.fontSize(10).text(cabecera.join(' | '));
      filas.forEach((f) => doc.text(f.join(' | ')));
      doc.end();
    });
  }

  return Reporte.create({
    tipo, rango, formato, id_generado_por, id_institucion: id_institucion || null,
    contenido_url: `/reportes/${nombre}`,
  });
}

module.exports = { generarReporte, DIR };
