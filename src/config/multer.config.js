import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError, ERROR_CODES } from '../errors/index.js';

// Función auxiliar para asegurar que una subcarpeta exista
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configuración de almacenamiento en disco con soporte para subcarpetas dinámicas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';

    // Determinamos la carpeta según la URL de la petición o el campo
    if (req.baseUrl.includes('users') || file.fieldname === 'document') {
      folder = 'documents';
    } else if (req.baseUrl.includes('products') || file.fieldname === 'thumbnail') {
      folder = 'products';
    } else if (req.baseUrl.includes('orders') || file.fieldname === 'receipt') {
      folder = 'receipts';
    }

    const uploadDir = path.resolve('uploads', folder);
    ensureDirExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filtro estricto de tipos de archivo permitidos (imágenes y PDFs)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(ERROR_CODES.VALIDATION_ERROR, 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WEBP) o PDFs.'), false);
  }
};

// Instancia base de Multer
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Middleware auxiliar para capturar errores nativos de Multer (ej: archivo muy pesado)
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(ERROR_CODES.VALIDATION_ERROR, 'El archivo supera el tamaño máximo permitido (5MB).'));
    }
    return next(new AppError(ERROR_CODES.VALIDATION_ERROR, `Error en la carga del archivo: ${err.message}`));
  }
  next(err);
};

export default upload;