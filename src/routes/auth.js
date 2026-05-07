const { Router } = require("express");
const router = Router();
const {
  registro,
  login,
  perfil,
  refrescar,
  logout,
} = require("../controllers/authController");
const verificarToken = require("../middleware/verificarToken");

router.post("/registro", registro);
router.post("/login", login);
router.get("/perfil", verificarToken, perfil);
router.post("/refresh", refrescar);
router.post("/logout", verificarToken, logout);

module.exports = router;
