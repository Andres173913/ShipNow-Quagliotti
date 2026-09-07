import UserRepository from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/crypto.utils.js';
import { generateToken } from '../utils/jwt.utils.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import logger from '../config/logger.js';

class UserService {

  // Traer usuarios con paginación y filtros
  static async getAll(params = {}) {
    return await UserRepository.find({}, params);
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
    // Validar campos obligatorios básicos
    if (!userdata || !userdata.email || !userdata.password) {
      logger.warn(`⚠️ Intento de registro fallido: Faltan campos obligatorios.`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'El email y la contraseña son obligatorios.');
    }

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

  //Subir y asociar un documento al usuario
  static async uploadDocument(userId, file, documentType) {
    // Validar existencia del usuario
    const user = await UserRepository.findById(userId);
    if (!user) {
      logger.warn(`⚠️ Intento de subida fallido: Usuario con ID ${userId} no encontrado.`);
      throw new AppError(ERROR_CODES.USER_NOT_FOUND);
    }

    //  Validar que el archivo exista (viene del middleware de multer)
    if (!file) {
      logger.warn(`⚠️ Intento de subida fallido: No se adjuntó archivo para el usuario ${userId}.`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Es necesario adjuntar un archivo.');
    }

    // Validar tipos de documentos permitidos (según criterio de aceptación)
    const validDocumentTypes = ['dni', 'license', 'certificate', 'other'];
    const docType = (documentType || 'other').toLowerCase();

    if (!validDocumentTypes.includes(docType)) {
      logger.warn(`⚠️ Intento de subida fallido: Tipo de documento inválido ('${docType}').`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, `Tipo de documento inválido. Opciones permitidas: ${validDocumentTypes.join(', ')}.`);
    }

    //  Construir objeto de metadatos exacto requerido
    const documentMetadata = {
      originalName: file.originalname,
      generatedName: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      documentType: docType,
      uploadedAt: new Date()
    };

    //  Guardar metadatos en el array de documentos del usuario usando el repositorio
    const updatedUser = await UserRepository.update(userId, {
      $push: { documents: documentMetadata }
    });

    logger.info(`📄 Documento '${docType}' subido y asociado exitosamente al usuario ID: ${userId}`);

    return updatedUser;
  }

}

export default UserService;