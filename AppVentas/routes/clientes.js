const express = require('express');
const router = express.Router();
const conexion = require('../db');

// Middleware para verificar roles permitidos
function verificarRolPermitido(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session.usuario || !rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).send('Acceso denegado');
    }
    next();
  };
}

// Mostrar todos los clientes (acceso libre a cualquier usuario autenticado)
router.get('/', async (req, res) => {
  try {
    const clientes = await conexion.query('SELECT * FROM cliente');
    res.render('clientes', { clientes });
  } catch (error) {
    res.status(500).send('Error al obtener clientes: ' + error);
  }
});

// Agregar nuevo cliente (solo admin y vendedor)
router.post('/agregar_cliente', verificarRolPermitido(['admin', 'vendedor']), async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  try {
    await conexion.query(
      'INSERT INTO cliente (nombre, telefono, direccion) VALUES (?, ?, ?)',
      [nombre, telefono, direccion]
    );
    res.redirect('/clientes');
  } catch (error) {
    res.status(500).send('Error al agregar cliente: ' + error);
  }
});

// Mostrar formulario de edición (solo admin y vendedor)
router.get('/editar_cliente/:id', verificarRolPermitido(['admin', 'vendedor']), async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await conexion.query('SELECT * FROM cliente WHERE id_cliente = ?', [id]);
    if (resultado.length > 0) {
      res.render('editar_clientes', { cliente: resultado[0] });
    } else {
      res.send('Cliente no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error al obtener cliente: ' + error);
  }
});

// Actualizar cliente (solo admin y vendedor)
router.post('/editar_cliente/:id', verificarRolPermitido(['admin', 'vendedor']), async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion } = req.body;
  try {
    await conexion.query(
      'UPDATE cliente SET nombre = ?, telefono = ?, direccion = ? WHERE id_cliente = ?',
      [nombre, telefono, direccion, id]
    );
    res.redirect('/clientes');
  } catch (error) {
    res.status(500).send('Error al actualizar cliente: ' + error);
  }
});

// Eliminar cliente (solo admin y vendedor)
router.get('/eliminar_cliente/:id', verificarRolPermitido(['admin', 'vendedor']), async (req, res) => {
  const { id } = req.params;
  try {
    await conexion.query('DELETE FROM cliente WHERE id_cliente = ?', [id]);
    res.redirect('/clientes');
  } catch (error) {
    res.status(500).send('Error al eliminar cliente: ' + error);
  }
});

module.exports = router;
