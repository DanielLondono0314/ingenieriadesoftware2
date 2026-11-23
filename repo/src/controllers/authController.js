const { login } = require('../services/authService');

// CU-002 | RF-005 | RNF-004, RNF-005 | E13-Login — POST /api/auth/login
async function iniciarSesion(req, res, next) {
  try {
    const { token, usuario } = await login(req.body.correo, req.body.contrasena);
    res.json({ token, usuario });
  } catch (err) { next(err); }
}

module.exports = { iniciarSesion };
