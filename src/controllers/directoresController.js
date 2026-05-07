const DirectorService = require("../services/DirectorService");

const listarDirectores = async (req, res, next) => {
  try {
    const directores = await DirectorService.obtenerTodos();
    res.json(directores);
  } catch (error) {
    next(error);
  }
};

const listarPeliculasDeDirector = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const resultado = await DirectorService.obtenerPeliculasPorDirector(id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarDirectores,
  listarPeliculasDeDirector,
};
