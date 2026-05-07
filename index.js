// 1. CARGAMOS EL .ENV PRIMERO (Fundamental para que db.js lo pueda leer)
require("dotenv").config();

// 2. AHORA SÍ, CONECTAMOS A LA BD
require("./src/config/db");

const express = require("express");
const peliculasRouter = require("./src/routes/peliculas");
const estadisticasRouter = require("./src/routes/estadisticas");
const directoresRouter = require("./src/routes/directores");
const authRouter = require("./src/routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(express.json());

// Rutas
app.use("/api/peliculas", peliculasRouter);
app.use("/api", estadisticasRouter); // Esto mapea a /api/estadisticas perfectamente
app.use("/api", directoresRouter);
app.use("/api/auth", authRouter);

// 404 global (Rutas no encontradas)
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Ruta ${req.method} ${req.url} no encontrada` });
});

// 3. NUEVO: MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// Aquí caen todos los "next(error)" que pusimos en el controlador
app.use((err, req, res, next) => {
  console.error("Error capturado:", err.message);

  // Si el error trae su propio status (ej. AppError con 404 o 400), lo usamos.
  // Si es un error de PostgreSQL (como un problema de sintaxis), devolvemos 500.
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Error interno del servidor",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
