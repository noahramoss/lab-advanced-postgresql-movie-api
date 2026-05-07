const { Router } = require("express");
const {
  listarDirectores,
  listarPeliculasDeDirector,
} = require("../controllers/directoresController");

const router = Router();

router.get("/", listarDirectores);
router.get("/:id/peliculas", listarPeliculasDeDirector);

module.exports = router;
