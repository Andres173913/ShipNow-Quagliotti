import path from 'path';
import fs from 'fs';
import { AppError, ERROR_CODES } from '../errors/index.js';

/**
 * Middleware para validar que el archivo exista y moverlo/organizarlo según el tipo de entidad
 * @param {string} entityFolder - Subcarpeta destino ('users', 'licenses', 'deliveries', etc.)
 */
export const validateAndOrganizeFile = (entityFolder) => {
  return (req, res, next) => {
    // Verificar si Multer adjuntó el archivo
    if (!req.file) {
      return next(new AppError(ERROR_CODES.VALIDATION_ERROR, 'No se ha proporcionado ningún archivo o el campo es incorrecto.'));
    }

    try {
      // Definir la ruta de destino final basada en la subcarpeta de la entidad
      const uploadBaseDir = path.resolve('uploads');
      const targetDir = path.join(uploadBaseDir, entityFolder);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Mover el archivo desde la carpeta temporal/base a la carpeta definitiva de la entidad
      const oldPath = req.file.path;
      const newFileName = req.file.filename;
      const newPath = path.join(targetDir, newFileName);

      fs.renameSync(oldPath, newPath);

      // Actualizar las propiedades del archivo en req.file para que el controlador/servicio usen la ruta correcta
      req.file.destination = targetDir;
      req.file.path = newPath;

      next();
    } catch (error) {
      next(new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error al procesar y almacenar el archivo en el servidor.'));
    }
  };
};