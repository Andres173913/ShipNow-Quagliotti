import { config } from '../config/config.js';
import { AppError, ERROR_CODES } from '../errors/index.js';

/**
 * Middleware para controlar el acceso a rutas internas / de prueba (Mocks, Logger Test) en entorno de producción.
 * En producción (NODE_ENV=production), estos endpoints quedan deshabilitados salvo que se explicite
 * la variable de entorno ENABLE_INTERNAL_ENDPOINTS=true.
 */
export const restrictInternalEndpoints = (req, res, next) => {
  if (config.NODE_ENV === 'production' && config.ENABLE_INTERNAL_ENDPOINTS !== 'true') {
    return next(
      new AppError(
        ERROR_CODES.FORBIDDEN_ACCESS,
        'Los endpoints internos de prueba y simulación no están disponibles en el entorno de producción.'
      )
    );
  }
  next();
};

export default restrictInternalEndpoints;
