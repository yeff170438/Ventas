const express = require('express');
const router = express.Router();
const pool = require('../db');

// Middleware de autenticación
function verificarSesion(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).send('Usuario no autenticado');
  }
  next();
}

// Mostrar página principal con clientes, productos y ventas recientes
router.get('/', verificarSesion, async (req, res) => {
  try {
    const clientes = await pool.query('SELECT id_cliente, nombre FROM cliente');
    const productos = await pool.query('SELECT id_producto, nombre, precio_venta AS precio, existencia, tipo_producto FROM producto');

    // Obtener últimas 10 ventas con nombre de cliente y vendedor
    const ventas = await pool.query(`
      SELECT v.id_venta, v.fecha, c.nombre AS cliente, u.nombre AS vendedor
      FROM venta v
      JOIN cliente c ON v.id_cliente = c.id_cliente
      JOIN usuario u ON v.id_usuario = u.id_usuario
      ORDER BY v.fecha DESC
      LIMIT 10
    `);

    // Obtener detalles para cada venta
    const ventasConDetalles = await Promise.all(
      ventas.map(async (venta) => {
        const detalles = await pool.query(
          `SELECT p.nombre AS producto, dv.cantidad, dv.precio, dv.subtotal
           FROM detalleventa dv
           JOIN producto p ON dv.id_producto = p.id_producto
           WHERE dv.id_venta = ?`,
          [venta.id_venta]
        );

        return { ...venta, detalles };
      })
    );

    res.render('simple', { clientes, productos, ventasConDetalles, error: null });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar datos.');
  }
});

// Procesar venta
router.post('/venta', verificarSesion, async (req, res) => {
  const { cliente, productos, descuento = 0 } = req.body;

  if (!cliente || !productos || productos.length === 0) {
    return res.status(400).send('Faltan datos para realizar la venta');
  }

  const id_usuario = req.session.usuario?.id;
  if (!id_usuario) {
    return res.status(401).send('Usuario no autenticado');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insertar en venta
    const resultVenta = await conn.query(
      'INSERT INTO venta (id_cliente, id_usuario) VALUES (?, ?)',
      [cliente, id_usuario]
    );
    const id_venta = resultVenta.insertId;

    // Insertar detalles y actualizar existencia
    for (const item of productos) {
      const prods = await conn.query(
        'SELECT precio_venta, existencia FROM producto WHERE id_producto = ?',
        [item.id_producto]
      );

      if (prods.length === 0) {
        throw new Error(`Producto con id ${item.id_producto} no encontrado`);
      }

      const precio = prods[0].precio_venta;
      const cantidad = parseInt(item.cantidad);
      const existenciaActual = prods[0].existencia;

      if (cantidad > existenciaActual) {
        throw new Error(`No hay suficiente existencia para el producto con id ${item.id_producto}`);
      }

      const subtotal = precio * cantidad;

      await conn.query(
        'INSERT INTO detalleventa (id_venta, id_producto, cantidad, precio, subtotal) VALUES (?, ?, ?, ?, ?)',
        [id_venta, item.id_producto, cantidad, precio, subtotal]
      );

      await conn.query(
        'UPDATE producto SET existencia = ? WHERE id_producto = ?',
        [existenciaActual - cantidad, item.id_producto]
      );
    }

    await conn.commit();
    res.json({ success: true, id_venta: id_venta.toString() });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).send('Error al registrar la venta: ' + error.message);
  } finally {
    conn.release();
  }
});

// Ruta para mostrar la boleta de venta
router.get('/boleta/:id', verificarSesion, async (req, res) => {
  const id_venta = req.params.id;
  try {
    const ventaData = await pool.query(`
      SELECT v.id_venta, v.fecha, c.nombre AS cliente, u.nombre AS vendedor
      FROM venta v
      JOIN cliente c ON v.id_cliente = c.id_cliente
      JOIN usuario u ON v.id_usuario = u.id_usuario
      WHERE v.id_venta = ?
    `, [id_venta]);

    if (ventaData.length === 0) return res.status(404).send('Venta no encontrada');

    const detalles = await pool.query(`
      SELECT p.nombre AS producto, dv.cantidad, dv.precio, dv.subtotal
      FROM detalleventa dv
      JOIN producto p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
    `, [id_venta]);

    res.render('boleta', { venta: ventaData[0], detalles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar la boleta');
  }
});

module.exports = router;
