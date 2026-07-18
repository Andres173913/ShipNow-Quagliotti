import {verifyToken} from '../utils/jwt.utils.js';

export const authenticateToken = (req, res, next) => {
   // Obtener el token de cookies o del encabezado de autorización
   const token = req.cookies.access_token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided. Access denied.' });
    }

    //validar el token
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    // Agregar la información del usuario decodificada al objeto de solicitud para su uso en rutas protegidas
    req.user = decoded;
    
    next();
};

// Middleware para autorizar roles específicos
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Validar que la petición haya pasado primero por authenticateJWT
    if (!req.user) {
      return res.status(500).json({ statusCode: 500, message: 'Error interno: Se requiere autenticación previa.' });
    }

    //Lógica de negocio/seguridad: Verificar si el rol del usuario está dentro de los permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acceso prohibido. No tienes los permisos necesarios para realizar esta acción.' 
      });
    }

    next(); // Si su rol está permitido, continúa al controlador
  };
};