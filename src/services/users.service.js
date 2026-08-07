import UserRepository from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/crypto.utils.js';
import { generateToken } from '../utils/jwt.utils.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import logger from '../config/logger.js';

class UserService {

  // Traer todos los usuarios
  static async getAll() {
    return await UserRepository.find();
  }

  // Traer un usuario por id
  static async getById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      logger.warn(`⚠️ Intento de búsqueda: Usuario con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }

  // Traer un usuario por email
  static async getByEmail(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      logger.warn(`⚠️ Intento de búsqueda: Usuario con email ${email} no encontrado.`);
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }

  // Crear un usuario
  static async create(userdata) {
    // Verificar si el email ya existe
    const existingUser = await UserRepository.findByEmail(userdata.email);
    if (existingUser) {
      logger.warn(`⚠️ Intento de registro fallido: El email ${userdata.email} ya está registrado.`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'El email ya se encuentra registrado.');
    }

    // Hashear contraseña
    const encryptedPassword = await hashPassword(userdata.password);

    const finalData = {
      ...userdata,
      password: encryptedPassword 
    };

    const newUser = await UserRepository.create(finalData);
    logger.info(`✨ Nuevo usuario creado exitosamente: ${newUser.email} (ID: ${newUser._id})`);
    
    return newUser;
  }

  // Actualizar un usuario
  static async update(id, data) {  
    // Validar que el usuario exista    
    const user = await UserRepository.findById(id);
    if (!user) {
      logger.warn(`⚠️ Intento de actualización fallido: Usuario con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    // Si viene un password, hashearlo
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    // Actualizar el usuario
    const updatedUser = await UserRepository.update(id, data);
    logger.info(`🔄 Usuario actualizado exitosamente: ID ${id}`);
    
    return updatedUser;
  }

  // Eliminar un usuario
  static async delete(id) {
    // Validar que el usuario exista
    const user = await UserRepository.findById(id);
    if (!user) {
      logger.warn(`⚠️ Intento de eliminación fallido: Usuario con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    // Eliminar el usuario
    const deletedUser = await UserRepository.delete(id);
    logger.info(`🗑️ Usuario eliminado: ID ${id} (${user.email})`);
    
    return deletedUser;
  }

  // Login de usuario
  static async login(email, password) {
    // Validar que el usuario exista (pasamos true para traer la contraseña oculta)
    const userDoc = await UserRepository.findByEmail(email, true);
    if (!userDoc) {
      logger.warn(`🔒 Intento de login fallido: Email no registrado -> ${email}`);
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 'Email o contraseña incorrectos.');
    }

    // Convertimos el documento de Mongoose a objeto plano de JS
    const user = userDoc.toObject();

    // Validar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`🔒 Intento de login fallido: Contraseña incorrecta para el email -> ${email}`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Email o contraseña incorrectos.');
    }

    // Payload para el token JWT
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    // Generar token
    const token = generateToken(tokenPayload);

    // Ocultar contraseña antes de retornar
    delete user.password;

    logger.info(`✅ Login exitoso para el usuario: ${user.email} (Rol: ${user.role})`);

    return { user, token };
  }

}

export default UserService;