const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { fecha_dia, semana, anio_semana, mes, anio_mes } = req.query;

    // 1. Historial total
    const historialVentas = await db.query(`
      SELECT 
        v.id_venta, v.fecha,
        u.nombre AS vendedor,
        c.nombre AS cliente,
        p.nombre AS producto,
        dv.cantidad, dv.precio, dv.subtotal
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

    // 4. Ventas por cliente
    const ventasPorCliente = await db.query(`
      SELECT 
        c.nombre AS cliente,
        COUNT(v.id_venta) AS total_ventas,
        IFNULL(SUM(dv.subtotal), 0) AS total_monto
      FROM cliente c
      LEFT JOIN venta v ON c.id_cliente = v.id_cliente
      LEFT JOIN detalleventa dv ON v.id_venta = dv.id_venta
      GROUP BY c.nombre
    `);

    // 5. Ventas por día (últimos 7 días)
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

    // --- Filtros dinámicos ---
    let ventasDelDia = [];
    if (fecha_dia) {
      ventasDelDia = await db.query(`
        SELECT 
          v.id_venta, v.fecha,
          u.nombre AS vendedor,
          c.nombre AS cliente,
          p.nombre AS producto,
          dv.cantidad, dv.precio, dv.subtotal
        FROM detalleventa dv
        INNER JOIN venta v ON dv.id_venta = v.id_venta
        INNER JOIN producto p ON dv.id_producto = p.id_producto
        INNER JOIN usuario u ON v.id_usuario = u.id_usuario
        INNER JOIN cliente c ON v.id_cliente = c.id_cliente
        WHERE DATE(v.fecha) = ?
        ORDER BY v.fecha DESC
      `, [fecha_dia]);
    }

    let ventasDeLaSemana = [];
    if (semana && anio_semana && mes) {
      const month = parseInt(mes);
      const weekNum = parseInt(semana);
      const year = parseInt(anio_semana);

      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const daysInMonth = lastDay.getDate();

      const startDay = 1 + (weekNum - 1) * 7;
      let endDay = startDay + 6;
      if (endDay > daysInMonth) endDay = daysInMonth;

      const fechaInicio = `${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
      const fechaFin = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

      ventasDeLaSemana = await db.query(`
        SELECT 
          v.id_venta, v.fecha,
          u.nombre AS vendedor,
          c.nombre AS cliente,
          p.nombre AS producto,
          dv.cantidad, dv.precio, dv.subtotal
        FROM detalleventa dv
        INNER JOIN venta v ON dv.id_venta = v.id_venta
        INNER JOIN producto p ON dv.id_producto = p.id_producto
        INNER JOIN usuario u ON v.id_usuario = u.id_usuario
        INNER JOIN cliente c ON v.id_cliente = c.id_cliente
        WHERE DATE(v.fecha) BETWEEN ? AND ?
        ORDER BY v.fecha DESC
      `, [fechaInicio, fechaFin]);
    }

    let ventasDelMes = [];
    if (mes && anio_mes) {
      ventasDelMes = await db.query(`
        SELECT 
          v.id_venta, v.fecha,
          u.nombre AS vendedor,
          c.nombre AS cliente,
          p.nombre AS producto,
          dv.cantidad, dv.precio, dv.subtotal
        FROM detalleventa dv
        INNER JOIN venta v ON dv.id_venta = v.id_venta
        INNER JOIN producto p ON dv.id_producto = p.id_producto
        INNER JOIN usuario u ON v.id_usuario = u.id_usuario
        INNER JOIN cliente c ON v.id_cliente = c.id_cliente
        WHERE MONTH(v.fecha) = ? AND YEAR(v.fecha) = ?
        ORDER BY v.fecha DESC
      `, [mes, anio_mes]);
    }

    res.render('reporte', {
      historialVentas,
      ventasPorUsuario,
      productosMasVendidos,
      ventasPorDia,
      ventasDelDia,
      ventasDeLaSemana,
      ventasDelMes,
      ventasPorCliente,
      fecha_dia,
      semana,
      anio_semana,
      mes,
      anio_mes
    });

  } catch (err) {
    console.error('Error al generar reportes:', err);
    res.status(500).send('Error interno al generar los reportes.');
  }
});

module.exports = router;
