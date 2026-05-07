const pool = require("../config/db");

const auditoria = (req, res, next) => {
  // Guardamos en memoria el inicio de la petición
  const ruta = req.originalUrl;
  const metodo = req.method;

  // Escuchamos el evento 'finish', que se dispara justo cuando Express
  // termina de enviar la respuesta al cliente.
  res.on("finish", async () => {
    try {
      // Intentamos obtener el ID del usuario (si el middleware verificarToken fue exitoso)
      const usuarioId = req.usuario ? req.usuario.id : null;
      const statusCode = res.statusCode; // Obtenemos el código final (200, 201, 401, etc.)

      // Insertamos el registro de forma asíncrona en segundo plano
      await pool.query(
        `INSERT INTO log_accesos (usuario_id, ruta, metodo, status_code) 
         VALUES ($1, $2, $3, $4)`,
        [usuarioId, ruta, metodo, statusCode],
      );
    } catch (error) {
      // En un middleware de auditoría, si falla el log, no queremos tumbar
      // la aplicación. Simplemente lo registramos en la consola del servidor.
      console.error("Error al registrar auditoría:", error.message);
    }
  });

  // Pasamos el control al siguiente middleware o controlador inmediatamente
  next();
};

module.exports = auditoria;
