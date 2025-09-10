// producto.js (actualizado para enviar "tipos" a la vista editar_producto)

var express = require('express');
var router = express.Router();
var conexion = require('../db');

// Ruta principal: mostrar lista de productos
router.get('/', async (req, res) => {
  try {
    const productos = await conexion.query(`
      SELECT 
        id_producto,
        nombre,
        tipo_producto,
        precio_compra,
        precio_venta,
        (precio_venta - precio_compra) AS ganancia,
        existencia
      FROM producto
    `);
    res.render('producto', { productos });
  } catch (error) {
    res.status(500).send('Error al obtener productos: ' + error);
  }
});

// Ruta para agregar un nuevo producto
router.post('/agregar_producto', async (req, res) => {
  const { nombre, tipo_producto, precio_compra, precio_venta, existencia } = req.body;
  try {
    await conexion.query(
      'INSERT INTO producto (nombre, tipo_producto, precio_compra, precio_venta, existencia) VALUES (?, ?, ?, ?, ?)',
      [nombre, tipo_producto, precio_compra, precio_venta, existencia]
    );
    res.redirect('/producto');
  } catch (error) {
    res.status(500).send('Error al agregar producto: ' + error);
  }
});

// Ruta para editar un producto (mostrar formulario)
router.get('/editar_producto/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await conexion.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
    const tiposData = await conexion.query('SELECT DISTINCT tipo_producto FROM producto');

    const tipos = tiposData.map(row => row.tipo_producto);

    if (resultado.length > 0) {
      res.render('editar_producto', { producto: resultado[0], tipos });
    } else {
      res.send('Producto no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error al obtener producto: ' + error);
  }
});

// Ruta para actualizar un producto
router.post('/editar_producto/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo_producto, precio_compra, precio_venta, existencia } = req.body;
  try {
    await conexion.query(
      'UPDATE producto SET nombre = ?, tipo_producto = ?, precio_compra = ?, precio_venta = ?, existencia = ? WHERE id_producto = ?',
      [nombre, tipo_producto, precio_compra, precio_venta, existencia, id]
    );
    res.redirect('/producto');
  } catch (error) {
    res.status(500).send('Error al actualizar producto: ' + error);
  }
});

// Ruta para eliminar un producto
router.get('/eliminar_producto/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await conexion.query('DELETE FROM producto WHERE id_producto = ?', [id]);
    res.redirect('/producto');
  } catch (error) {
    res.status(500).send('Error al eliminar producto: ' + error);
  }
});

module.exports = router;
