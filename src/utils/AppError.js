// src/utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Captura dónde ocurrió el error para facilitar el debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
