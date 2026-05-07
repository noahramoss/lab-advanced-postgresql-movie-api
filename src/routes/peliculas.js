// src/routes/peliculas.js
const { Router } = require("express");
const verificarToken = require("../middleware/verificarToken");
const verificarRol = require("../middleware/verificarRol");
const auditoria = require("../middleware/auditoria");
const {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  patchPelicula,
  eliminarPelicula,
  listarResenas,
  crearResena,
  calificarPelicula,
} = require("../controllers/peliculasController");

const router = Router();

// Rutas públicas
router.get("/", listarPeliculas);
router.get("/:id", obtenerPelicula);
router.get("/:id/resenas", listarResenas);

// Rutas protegidas: cualquier usuario autenticado
router.post("/", verificarToken, auditoria, crearPelicula);
router.post("/:id/resenas", verificarToken, auditoria, crearResena);
router.post("/:id/calificar", verificarToken, auditoria, calificarPelicula);

//Rutas protegidas: solo admin
router.put(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  auditoria,
  actualizarPelicula,
);
router.patch(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  auditoria,
  patchPelicula,
);
router.delete(
  "/:id",
  verificarToken,
  verificarRol("admin"),
  auditoria,
  eliminarPelicula,
);

module.exports = router;
