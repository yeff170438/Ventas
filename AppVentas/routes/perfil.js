const express = require('express');
const router = express.Router();
const pool = require('../db');

// Mostrar perfil del usuario logueado
router.get('/', async (req, res) => {
  const usuarioSession = req.session.usuario;

  if (!usuarioSession) {
    return res.redirect('/');
  }

  try {
    // Recupera el rol también
    const rows = await pool.query(
      'SELECT id_usuario, nombre, rol, telefono, direccion FROM usuario WHERE id_usuario = ?',
      [usuarioSession.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }

    const usuario = rows[0];
    res.render('perfil', { usuario });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).send('Error interno al cargar perfil');
  }
});

module.exports = router;
