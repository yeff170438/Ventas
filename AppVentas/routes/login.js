const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

// ✅ Usuario lectura definido en la app con contraseña hasheada
const USUARIO_LECTURA = {
  nombre: 'lectura',
  contrasena: '$2b$10$aHZDe54oJ.NoOiKY9.pd1ODAI4S0HNzFfziQC4lFuomToOFtovZlC', // hash de "123"
  rol: 'lectura'
};

// Mostrar login
router.get('/', (req, res) => {
  res.render('login', { error: null });
});

// Procesar login
router.post('/', async (req, res) => {
  const { usuario, contrasena } = req.body;

  // ✔️ Verificar si es el usuario lectura
  if (usuario === USUARIO_LECTURA.nombre) {
    const passwordCorrecta = await bcrypt.compare(contrasena, USUARIO_LECTURA.contrasena);
    if (!passwordCorrecta) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    // Guardar datos del usuario lectura en la sesión
    req.session.usuario = {
      id: null, // No existe en BD
      nombre: USUARIO_LECTURA.nombre,
      rol: USUARIO_LECTURA.rol
    };

    return res.redirect('/menu');
  }

  // 🔍 Si no es lectura, buscar el usuario en la BD
  try {
    const rows = await pool.query(
      'SELECT id_usuario, nombre, rol, contrasena FROM usuario WHERE nombre = ?',
      [usuario]
    );

    if (rows.length === 0) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    const usuarioBD = rows[0];

    // Comparar la contraseña ingresada con el hash almacenado
    const passwordCorrecta = await bcrypt.compare(contrasena, usuarioBD.contrasena);

    if (!passwordCorrecta) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    // Guardar datos del usuario de la BD en la sesión
    req.session.usuario = {
      id: usuarioBD.id_usuario,
      nombre: usuarioBD.nombre,
      rol: usuarioBD.rol
    };

    res.redirect('/menu');

  } catch (err) {
    console.error('Error en login:', err);
    res.render('login', { error: 'Error interno al procesar el login' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.send('Error al cerrar sesión');
    }
    res.redirect('/');
  });
});

module.exports = router;
