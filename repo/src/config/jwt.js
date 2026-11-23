// RF-005 | RNF-004 — secreto y vigencia del JWT. En producción el secreto es obligatorio.
function secreto() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio cuando NODE_ENV=production');
  }
  return 'dev-secret-cambiar';
}
const expiracion = () => process.env.JWT_EXPIRES || '8h';
module.exports = { secreto, expiracion };
