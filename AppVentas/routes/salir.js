const express = require('express');
const router = express.Router();

// Ruta para cerrar sesión
router.get('/', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    // Después de destruir la sesión, mostramos la página de confirmación
    res.render('salir');
  });
});

module.exports = router;
