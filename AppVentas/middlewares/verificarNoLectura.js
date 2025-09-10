// middlewares/verificarNoLectura.js

function verificarNoLectura(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).send('No autenticado');
  }

  if (req.session.usuario.rol === 'lectura') {
    return res.status(403).send('Acción no permitida para este usuario');
  }

  next();
}

module.exports = verificarNoLectura;
