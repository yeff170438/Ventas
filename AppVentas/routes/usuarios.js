const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const conexion = require('../db');

// Mostrar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await conexion.query('SELECT * FROM usuario');
    res.render('usuarios', { usuarios });
  } catch (error) {
    res.status(500).send('Error al obtener usuarios: ' + error);
  }
});


// Agregar nuevo usuario
router.post('/agregar_usuario', async (req, res) => {
  const { nombre, telefono, direccion, rol, contrasena } = req.body;
  
  try {
    // Hashear la contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    await conexion.query(
      'INSERT INTO usuario (nombre, telefono, direccion, rol, contrasena) VALUES (?, ?, ?, ?, ?)',
      [nombre, telefono, direccion, rol || 'vendedor', hash]
    );

    res.redirect('/usuarios');
  } catch (error) {
    res.status(500).send('Error al agregar usuario: ' + error);
  }
});

// Mostrar formulario de edición
router.get('/editar_usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await conexion.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    if (resultado.length > 0) {
      res.render('editar_usuario', { usuario: resultado[0] });
    } else {
      res.send('Usuario no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error al obtener usuario: ' + error);
  }
});

// Actualizar usuario (sin cambiar contraseña por ahora)
router.post('/editar_usuario/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion, rol } = req.body;

  try {
    await conexion.query(
      'UPDATE usuario SET nombre = ?, telefono = ?, direccion = ?, rol = ? WHERE id_usuario = ?',
      [nombre, telefono, direccion, rol, id]
    );
    res.redirect('/usuarios');
  } catch (error) {
    res.status(500).send('Error al actualizar usuario: ' + error);
  }
});

// Eliminar usuario
router.get('/eliminar_usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
    res.redirect('/usuarios');
  } catch (error) {
    res.status(500).send('Error al eliminar usuario: ' + error);
  }
});

module.exports = router;
