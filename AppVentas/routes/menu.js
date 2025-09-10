// routes/menu.js

var express = require('express');
var router = express.Router();
var conexion = require('../db');

// Ruta del menú principal con estadísticas
router.get('/', async function (req, res) {
  try {
    // 1) Total de productos
    const productosRows = await conexion.query('SELECT COUNT(*) AS total FROM producto');
    const totalProductos = productosRows[0]?.total || 0;

    // 2) Total de ventas
    const ventasRows = await conexion.query('SELECT COUNT(*) AS total FROM venta');
    const totalVentas = ventasRows[0]?.total || 0;

    // 3) Total de usuarios
    const usuariosRows = await conexion.query('SELECT COUNT(*) AS total FROM usuario');
    const totalUsuarios = usuariosRows[0]?.total || 0;

    // 4) Total de clientes
    const clientesRows = await conexion.query('SELECT COUNT(*) AS total FROM cliente');
    const totalClientes = clientesRows[0]?.total || 0;

    // 5) Monto total de las ventas
    const ventasTotalesRows = await conexion.query('SELECT IFNULL(SUM(subtotal), 0) AS total FROM detalleventa');
    const montoTotal = parseFloat(ventasTotalesRows[0]?.total || 0).toFixed(2);

    // 6) Historial detallado de ventas
    const ventasDetalladas = await conexion.query(`
      SELECT 
        v.id_venta,
        c.nombre AS cliente,
        u.nombre AS vendedor,
        v.fecha,
        p.nombre AS producto,
        dv.cantidad,
        dv.precio,
        dv.subtotal
      FROM detalleventa dv
      INNER JOIN venta v ON dv.id_venta = v.id_venta
      INNER JOIN producto p ON dv.id_producto = p.id_producto
      INNER JOIN cliente c ON v.id_cliente = c.id_cliente
      INNER JOIN usuario u ON v.id_usuario = u.id_usuario
      ORDER BY v.fecha DESC
    `);

    // Renderiza el menú
    res.render('menu', {
      totalProductos,
      totalVentas,
      totalUsuarios,
      totalClientes,
      montoTotal,
      ventasDetalladas,
      usuario: req.session.usuario || 'usuario', // nombre del usuario
      rol: req.session.rol || 'sin rol', // agrega el rol
      usuarioImagen: req.session.imagen || 'default.png'
    });

  } catch (err) {
    console.error('Error al cargar datos del menú:', err);
    res.render('menu', {
      totalProductos: 0,
      totalVentas: 0,
      totalUsuarios: 0,
      totalClientes: 0,
      montoTotal: '0.00',
      ventasDetalladas: [],
      usuario: req.session.usuario || 'usuario',
      rol: req.session.rol || 'sin rol',
      usuarioImagen: req.session.imagen || 'default.png'
    });
  }
});

module.exports = router;
