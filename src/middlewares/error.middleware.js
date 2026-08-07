import { config } from "../config/config.js";
import { ERROR_CODES } from "../errors/error-codes.js";
import { AppError } from "../errors/app-error.js";
import logger from "../config/logger.js";

// Middleware para capturar rutas inexistentes (404)
export const notFoundHandler = (req, res, next) => {
    const error = new AppError(ERROR_CODES.ROUTE_NOT_FOUND);
    next(error);
};

// Middleware global de manejo de errores
export const errorHandler = (error, req, res, next) => {
    const isCustomError = error instanceof AppError;
    const customError = isCustomError ? error : mapToCustomError(error);

    // Si es un error de ID inválido de Mongoose
    if (error.name === "CastError") {
        // Sale en rojo en la consola (como error) pero limpio y sin el stack trace
        logger.error(`❌ [INVALID_ID]: El formato del ID (${error.value}) es inválido para el campo "${error.path}".`);
        
        return res.status(400).json({
            status: "error",
            code: "INVALID_ID",
            message: `El formato del ID (${error.value}) es inválido.`
        });
    }

    if (isCustomError) {
        logger.warn(`⚠️ [${customError.code}]: ${customError.message}`);
    } else {
        // Únicamente para errores 500 reales de programación o base de datos caida
        logger.error(`🔥 Unhandled Error: ${error.message}`, { stack: error.stack });
    }

    res.status(customError.statusCode).json({
        status: "error",
        code: customError.code,
        message: customError.message,
        // Si estás en desarrollo, para mostrar el detalle o stack:
        ...(config.NODE_ENV === 'development' && { details: customError.details })
    });
};

// Función para mapear errores no personalizados a errores personalizados
const mapToCustomError = (error) => {
    // Errores de Mongoose específicos
    if (error.name === "CastError") {
        return new AppError(ERROR_CODES.INVALID_ID, `El formato del ID (${error.value}) es inválido.`);
    }
    if (error.code === 11000) {
        return new AppError(ERROR_CODES.DUPLICATE_KEY, "El recurso ya existe en la base de datos.");
    }
    if (error.name === "ValidationError") {
        return new AppError(ERROR_CODES.VALIDATION_ERROR, error.message, error.details);
    }

    // Si el error ya viene con un status code propio (ej. tirado desde un servicio con un 400 o 404 custom)
    if (error.statusCode) {
        return new AppError(
            { statusCode: error.statusCode, code: error.code || "BAD_REQUEST", message: error.message },
            error.message
        );
    }

    // Por defecto, si realmente no sabemos qué es, recién ahí tiramos el 500
    return new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, error.message || "Ocurrió un error inesperado en el servidor.");
};