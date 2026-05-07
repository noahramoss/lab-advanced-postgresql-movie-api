const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const AppError = require("../utils/AppError");

const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token no proporcionado", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    // NUEVO: Verificamos si el token está en la blacklist
    const { rows } = await pool.query(
      "SELECT token FROM tokens_invalidos WHERE token = $1",
      [token],
    );

    if (rows.length > 0) {
      // Si existe en la tabla, el token fue revocado (logout)
      return next(
        new AppError("Token revocado. Inicia sesión nuevamente.", 401),
      );
    }

    // Si no está en la blacklist, procedemos a verificar la firma
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expirado", 401));
    }
    return next(new AppError("Token inválido", 401));
  }
};

module.exports = verificarToken;
