import { verifyToken } from '../utils/jwt.utils.js';

export const authenticateToken = (req, res, next) => {
   // Obtener el token de cookies o del encabezado de autorización
   const token = req.cookies.access_token || req.headers['authorization']?.split(' ')[1];
   
    if (!token) {
        // Registrar el intento de acceso sin token si req.logger está disponible
        if (req.logger) {
            req.logger.warn(`⚠️ Intento de acceso sin token a ${req.method} ${req.url}`);
        }
        return res.status(401).json({ message: 'No token provided. Access denied.' });
    }

    // Validar el token
    const decoded = verifyToken(token);

    if (!decoded) {
        if (req.logger) {
            req.logger.warn(`⚠️ Token inválido o expirado en intento a ${req.method} ${req.url}`);
        }
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    // Agregar la información del usuario decodificada al objeto de solicitud
    req.user = decoded;
    
    next();
};

// Middleware para autorizar roles específicos
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Validar que la petición haya pasado primero por authenticateToken
    if (!req.user) {
        if (req.logger) {
            req.logger.error(`🔥 Error interno: authorizeRoles usado sin autenticación previa en ${req.method} ${req.url}`);
        }
        return res.status(500).json({ statusCode: 500, message: 'Error interno: Se requiere autenticación previa.' });
    }

    // Verificar si el rol del usuario está dentro de los permitidos
    if (!allowedRoles.includes(req.user.role)) {
        if (req.logger) {
            req.logger.warn(`⛔ Acceso prohibido: El usuario '${req.user.email || req.user.id}' con rol '${req.user.role}' intentó acceder a ruta protegida para [${allowedRoles.join(', ')}]`);
        }
        return res.status(403).json({
          message: 'Acceso prohibido. No tienes los permisos necesarios para realizar esta acción.' 
        });
    }

    next(); // Si su rol está permitido, continúa al controlador
  };
};