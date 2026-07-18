import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

// Generar un token con la información del usuario (payload)
export const generateToken = (payload) => {
  const dataToSign = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };

  return jwt.sign(dataToSign, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Verificar si un token es válido y retornar su contenido
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null; // Si expiró o es falso, retorna null
  }
};