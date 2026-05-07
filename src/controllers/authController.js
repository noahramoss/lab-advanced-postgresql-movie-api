const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
  );
};

const generarRefreshToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
    },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: process.env.JWT_SECRET_EXPIRES_IN || "7d" },
  );
};

// POST /api/auth/registro
const registro = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      throw new AppError("nombre, email y password obligatorios", 400);
    }

    if (password.length < 6) {
      throw new AppError(
        "La constraseña debe tener al menos 6 caracteres",
        400,
      );
    }

    //Comprobar si ya existe el email
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );
    if (existe.rows.length > 0) {
      throw new AppError("Ya existe un usuario con este email", 409);
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const rolFinal = rol === "admin" ? "admin" : "usuario";

    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, password_hash, rolFinal],
    );

    const usuario = rows[0];
    const token = generarToken(usuario);
    const tokenRefresh = generarRefreshToken(usuario);

    await pool.query(`UPDATE usuarios SET refresh_token = $1 WHERE id = $2`, [
      tokenRefresh,
      usuario.id,
    ]);

    res.status(201).json({ token, tokenRefresh, usuario });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("email y password son obligatorios", 400);
    }

    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND activo = true",
      [email],
    );
    if (rows.length === 0) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (!passwordValida) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    const token = generarToken(usuario);
    const tokenRefresh = generarRefreshToken(usuario);

    await pool.query(`UPDATE usuarios SET refresh_token = $1 WHERE id = $2`, [
      tokenRefresh,
      usuario.id,
    ]);

    res.json({
      token,
      tokenRefresh,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/perfil
const perfil = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1`,
      [req.usuario.id],
    );

    if (rows.length === 0) {
      throw new AppError("Usuario no encontrado", 404);
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

//POST /api/auth/refresh BONUS
const refrescar = async (req, res, next) => {
  try {
    const { tokenRefresh } = req.body;

    if (!tokenRefresh) {
      throw new AppError("No hay refresh token", 401);
    }

    const payload = jwt.verify(tokenRefresh, process.env.JWT_SECRET_REFRESH);

    const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      payload.id,
    ]);

    const usuario = rows[0];

    if (!usuario) throw new AppError("Usuario no encontrado", 404);

    if (usuario.token_refresh !== tokenRefresh) {
      throw new AppError("No coinciden los tokens", 403);
    }

    const nuevoToken = generarToken(usuario);

    res.json({ token: nuevoToken });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout BONUS
const logout = async (req, res, next) => {
  try {
    // Obtenemos el token del header (ya sabemos que viene porque usaremos el middleware verificarToken)
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    // Insertamos el token en la lista negra
    await pool.query("INSERT INTO tokens_invalidos (token) VALUES ($1)", [
      token,
    ]);

    // Opcional pero recomendado: Borrar también el refresh_token del usuario en la tabla usuarios
    await pool.query("UPDATE usuarios SET refresh_token = NULL WHERE id = $1", [
      req.usuario.id,
    ]);

    res.json({ mensaje: "Sesión cerrada correctamente. Token invalidado." });
  } catch (error) {
    next(error);
  }
};

module.exports = { registro, login, perfil, refrescar, logout };
