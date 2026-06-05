require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { sequelize } = require('./models');
const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Frontend (SPA estática): consola de gestión que consume el API /api.
// E15-Mapa de Navegación · E16-Wireframes — capa de presentación del módulo.
app.use(express.static(path.join(__dirname, '..', 'public')));

// Metadatos del API (antes servía '/', ahora lo sirve el index.html de la SPA).
app.get('/api', (req, res) => {
  res.json({
    nombre: 'IA-K12 Backend',
    descripcion: 'Plataforma de Alfabetización en IA para K-12 — Trabajo Parcial 1',
    version: '0.1.0',
    endpoints: '/api',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', mensaje: err.message });
  }
});

app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[db] Conexión a PostgreSQL establecida');
  } catch (err) {
    console.error('[db] No fue posible conectar:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`[api] Escuchando en http://localhost:${PORT}`);
  });
})();
