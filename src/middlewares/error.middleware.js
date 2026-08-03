import { config } from "../config/config.js";
import { ERROR_CODES } from "../errors/error-codes.js";
import { AppError } from "../errors/app-error.js";

// Middleware para capturar rutas inexistentes (404)
export const notfoundHandler = (req, res, next) => {
    // Usamos AppError para mantener la coherencia en toda la app
    const error = new AppError(ERROR_CODES.ROUTE_NOT_FOUND);
    next(error);
};

// Middleware global de manejo de errores
export const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || error.status || 500;
    const errorCode = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;

    const responsePayload = {
        status: "error",
        error: errorCode,
        message: error.message || "Ocurrió un error interno en el servidor"
    };

    // Agregar detalles si existen (por ejemplo, errores de validación)
    if (error.details) {
        responsePayload.details = error.details;
    }

    // Opcional: imprimir stack trace en consola solo durante desarrollo
    if (config.NODE_ENV === "development" && statusCode === 500) {
        console.error("🔥 Internal Server Error:", error);
    }

    res.status(statusCode).json(responsePayload);
};