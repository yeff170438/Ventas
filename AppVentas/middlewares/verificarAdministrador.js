function verificarAdministrador(req, res, next) {
  const usuario = req.session.usuario;

  if (!usuario) {
    return res.redirect('/'); // Si no hay sesión, redirige al login
  }

  if (usuario.rol !== 'administrador') {
    // Renderiza la página personalizada de error
    return res.status(403).render('error_administrador', {
      usuario: usuario
    });
  }

  next(); // Si es administrador, continúa
}

module.exports = verificarAdministrador;
