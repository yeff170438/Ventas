const express = require('express');
const router = express.Router();

// Ruta del formulario
router.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para procesar login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validación simple (usuario fijo)
  if (username === 'admin' && password === '1234') {
    res.redirect('/hola');
  } else {
    res.send('Credenciales incorrectas');
  }
});

// Página protegida (Hola Mundo)
router.get('/hola', (req, res) => {
  res.render('hola');
});

module.exports = router;
