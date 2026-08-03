import UserRepository from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/crypto.utils.js';
import { generateToken } from '../utils/jwt.utils.js';
import { AppError, ERROR_CODES } from '../errors/index.js';

class UserService {

  // Traer todos los usuarios
  static async getAll() {
    return await UserRepository.find();
  }

  // Traer un usuario por id
  static async getById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }

  // Traer un usuario por email
  static async getByEmail(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }

  // Crear un usuario
  static async create(userdata) {
    // Verificar si el email ya existe
    const existingUser = await UserRepository.findByEmail(userdata.email);
    if (existingUser) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'El email ya se encuentra registrado.');
    }

    // Hashear contraseña
    const encryptedPassword = await hashPassword(userdata.password);

    const finalData = {
      ...userdata,
      password: encryptedPassword 
    };

    return await UserRepository.create(finalData);
  }

  // Actualizar un usuario
  static async update(id, data) {  
    // Validar que el usuario exista    
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    // Si viene un password, hashearlo
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    // Actualizar el usuario
    return await UserRepository.update(id, data);
  }

  // Eliminar un usuario
  static async delete(id) {
    // Validar que el usuario exista
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    // Eliminar el usuario
    return await UserRepository.delete(id);
  }

  // Login de usuario
  static async login(email, password) {
    // Validar que el usuario exista (pasamos true para traer la contraseña oculta)
    const userDoc = await UserRepository.findByEmail(email, true);
    if (!userDoc) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 'Email o contraseña incorrectos.');
    }

    // Convertimos el documento de Mongoose a objeto plano de JS
    const user = userDoc.toObject();

    // Validar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
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

    return { user, token };
  }

}

export default UserService;