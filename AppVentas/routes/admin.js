const express = require('express');
const router = express.Router();
const verificarAdministrador = require('../middlewares/verificarAdministrador');

router.get('/', verificarAdministrador, (req, res) => {
  res.render('admin', { usuario: req.session.usuario.nombre });
});

module.exports = router;
