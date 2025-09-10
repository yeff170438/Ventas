const bcrypt = require('bcrypt');
const pool = require('../db'); // Asegúrate de que esta ruta sea correcta según tu proyecto

async function actualizarContraseñas() {
  try {
    // Traer todos los usuarios
    const usuarios = await pool.query('SELECT id_usuario, nombre FROM usuario');

    for (const usuario of usuarios) {
      const contrasenaPlano = '1234'; // Contraseña por defecto
      const hash = await bcrypt.hash(contrasenaPlano, 10); // Genera el hash

      // Actualizar contraseña del usuario
      await pool.query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [hash, usuario.id_usuario]);
      console.log(`Contraseña actualizada para el usuario: ${usuario.nombre}`);
    }

    console.log('Todas las contraseñas han sido actualizadas correctamente.');
    process.exit();
  } catch (error) {
    console.error('Error actualizando contraseñas:', error);
    process.exit(1);
  }
}

actualizarContraseñas();
