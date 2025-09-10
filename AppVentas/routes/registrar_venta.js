const express = require("express");
const router = express.Router();
const db = require("../db");
const funciones = require("../funciones");

router.post("/", async (req, res) => {
    const lista = req.session.lista || [];
    const idUsuario = req.session.usuario ? req.session.usuario.id : null;
    const idCliente = req.session.clienteVenta || null;

    if (lista.length === 0) {
        return res.redirect("/vender");
    }

    try {
        // Calcular total
        const total = funciones.calcularTotalLista(lista);

        // Insertar venta
        const [resultadoVenta] = await db.execute(
            "INSERT INTO Venta (id_cliente, id_usuario, total, fecha) VALUES (?, ?, ?, NOW())",
            [idCliente, idUsuario, total]
        );

        const idVenta = resultadoVenta.insertId;

        // Insertar detalle y actualizar stock
        for (const producto of lista) {
            const subtotal = producto.venta * producto.cantidad;

            await db.execute(
                "INSERT INTO DetalleVenta (id_venta, id_producto, cantidad, precio, subtotal) VALUES (?, ?, ?, ?, ?)",
                [idVenta, producto.id, producto.cantidad, producto.venta, subtotal]
            );

            await db.execute(
                "UPDATE Producto SET existencia = existencia - ? WHERE id_producto = ?",
                [producto.cantidad, producto.id]
            );
        }

        // Limpiar sesión y poner mensaje
        req.session.lista = [];
        req.session.clienteVenta = null;
        req.session.mensaje = "Venta realizada con éxito";

        res.redirect("/vender");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al registrar la venta");
    }
});

module.exports = router;
