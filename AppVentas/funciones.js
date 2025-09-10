const db = require("./db");

function calcularTotalLista(lista) {
    if (!Array.isArray(lista)) return 0;
    return lista.reduce((acc, prod) => {
        const precio = prod.precio_venta || 0;
        const cantidad = prod.cantidad || 0;
        return acc + precio * cantidad;
    }, 0);
}

async function obtenerClientes() {
    try {
        const [rows] = await db.execute("SELECT * FROM cliente");
        return rows;
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return [];
    }
}

async function obtenerClientePorId(id) {
    try {
        const [rows] = await db.execute("SELECT * FROM cliente WHERE id_cliente = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error(`Error al obtener cliente con id ${id}:`, error);
        return null;
    }
}

async function obtenerProductoPorCodigo(id_producto) {
    try {
        const [rows] = await db.execute("SELECT * FROM producto WHERE id_producto = ?", [id_producto]);
        if (rows.length > 0) {
            const p = rows[0];
            return {
                id_producto: p.id_producto,
                nombre: p.nombre,
                precio_compra: p.precio_compra,
                precio_venta: p.precio_venta,
                ganancia: p.ganancia,
                existencia: p.existencia,
                cantidad: 1 // Por defecto
            };
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener producto con codigo ${id_producto}:`, error);
        return null;
    }
}

module.exports = {
    calcularTotalLista,
    obtenerClientes,
    obtenerClientePorId,
    obtenerProductoPorCodigo
};
