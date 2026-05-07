const pool = require("../config/db");
const AppError = require("../utils/AppError");

class DirectorService {
  async obtenerTodos() {
    const { rows } = await pool.query(
      "SELECT * FROM directores ORDER BY nombre ASC",
    );
    return rows;
  }

  async obtenerPeliculasPorDirector(directorId) {
    // Verificamos si el director existe
    const { rows: directorRows } = await pool.query(
      "SELECT * FROM directores WHERE id = $1",
      [directorId],
    );

    if (directorRows.length === 0) {
      throw new AppError("Director no encontrado", 404);
    }

    // Buscamos sus películas
    const { rows: peliculas } = await pool.query(
      `SELECT p.id, p.titulo, p.anio, p.nota, g.nombre AS genero 
       FROM peliculas p 
       LEFT JOIN generos g ON p.genero_id = g.id 
       WHERE p.director_id = $1 
       ORDER BY p.anio DESC`,
      [directorId],
    );

    return {
      director: directorRows[0],
      peliculas: peliculas,
    };
  }
}

module.exports = new DirectorService();
