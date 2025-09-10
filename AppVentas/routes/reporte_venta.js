const express = require('express');
const router = express.Router();
const db = require('../db');

// Submenú de reportes
router.get('/', async (req, res) => {
  try {
    // 1. Historial total de ventas
    const historialVentas = await db.query(`
      SELECT 
        v.id_venta,
        v.fecha,
        u.nombre AS vendedor,
        c.nombre AS cliente,
        p.nombre AS producto,
        dv.cantidad,
        dv.precio,
        dv.subtotal
      FROM detalleventa dv
      INNER JOIN venta v ON dv.id_venta = v.id_venta
      INNER JOIN producto p ON dv.id_producto = p.id_producto
      INNER JOIN usuario u ON v.id_usuario = u.id_usuario
      INNER JOIN cliente c ON v.id_cliente = c.id_cliente
      ORDER BY v.fecha DESC
    `);

    // 2. Ventas por usuario
    const ventasPorUsuario = await db.query(`
      SELECT 
        u.nombre AS usuario,
        COUNT(v.id_venta) AS total_ventas,
        IFNULL(SUM(dv.subtotal), 0) AS total_monto
      FROM usuario u
      LEFT JOIN venta v ON u.id_usuario = v.id_usuario
      LEFT JOIN detalleventa dv ON v.id_venta = dv.id_venta
      GROUP BY u.nombre
    `);

    // 3. Productos más vendidos
    const productosMasVendidos = await db.query(`
      SELECT 
        p.nombre AS producto,
        SUM(dv.cantidad) AS cantidad_total,
        SUM(dv.subtotal) AS total_recaudado
      FROM detalleventa dv
      INNER JOIN producto p ON dv.id_producto = p.id_producto
      GROUP BY p.nombre
      ORDER BY cantidad_total DESC
      LIMIT 10
    `);

    // 4. Ventas por día (últimos 7 días)
    const ventasPorDia = await db.query(`
      SELECT 
        DATE(v.fecha) AS dia,
        SUM(dv.subtotal) AS total
      FROM venta v
      INNER JOIN detalleventa dv ON v.id_venta = dv.id_venta
      WHERE v.fecha >= CURDATE() - INTERVAL 7 DAY
      GROUP BY DATE(v.fecha)
      ORDER BY dia DESC
    `);

    // 5. Ventas por semana (últimos 4 semanas)
    const ventasPorSemana = await db.query(`
      SELECT 
        WEEK(v.fecha) AS semana,
        YEAR(v.fecha) AS anio,
        SUM(dv.subtotal) AS total
      FROM venta v
      INNER JOIN detalleventa dv ON v.id_venta = dv.id_venta
      WHERE v.fecha >= CURDATE() - INTERVAL 28 DAY
      GROUP BY anio, semana
      ORDER BY anio DESC, semana DESC
    `);

    // 6. Ventas por mes (últimos 6 meses)
    const ventasPorMes = await db.query(`
      SELECT 
        MONTH(v.fecha) AS mes,
        YEAR(v.fecha) AS anio,
        SUM(dv.subtotal) AS total
      FROM venta v
      INNER JOIN detalleventa dv ON v.id_venta = dv.id_venta
      WHERE v.fecha >= CURDATE() - INTERVAL 6 MONTH
      GROUP BY anio, mes
      ORDER BY anio DESC, mes DESC
    `);

    // Renderizar vista
    res.render('reporte_venta', {
      historialVentas,
      ventasPorUsuario,
      productosMasVendidos,
      ventasPorDia,
      ventasPorSemana,
      ventasPorMes
    });

  } catch (err) {
    console.error('Error al generar reportes:', err);
    res.status(500).send('Error interno al generar los reportes.');
  }
});

module.exports = router;