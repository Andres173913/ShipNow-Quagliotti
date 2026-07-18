import UserRepository from '../repositories/users.repository.js';
import {hashPassword, comparePassword} from '../utils/crypto.utils.js';
import {generateToken} from '../utils/jwt.utils.js';
import {ERROR_MESSAGES} from '../constants/errors.js';

class UserService {

  //traer todos los usuarios
  static async getAll() {
    return await UserRepository.find();
  }

  //traer un usuario por id
  static async getById(id) {
    return await UserRepository.findById(id);
  }

  //traer un usuario por email
  static async getByEmail(email) {
    return await UserRepository.findByEmail(email);
  }

  // crear un usuario
  static async create(userdata) {
    
    //verificar si el email ya existe
    const ExistingUser = await UserRepository.findByEmail(userdata.email);
    if (ExistingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    //hash password
    const encryptedPassword = await hashPassword(userdata.password);

    const finalData={
      ...userdata,
      password: encryptedPassword 
    }

    return await UserRepository.create(finalData);
  }

  //actualizar un usuario
  static async update(id, data) {  
    
    //validar que el usuario exista    
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    //si viene un password, hashearlo
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    //actualizar el usuario
    return await UserRepository.update(id, data);
  }

  // Query para eliminar un usuario
  static async delete(id) {
    //validar que el usuario exista
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    //eliminar el usuario
    return await UserRepository.delete(id);
  }

  //login de usuario
  static async login(email, password) {
    //validar que el usuario exista se pasa el true para traer la contraseña oculta
    const userDoc = await UserRepository.findByEmail(email, true);
    if (!userDoc) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Convertimos el documento pesado de Mongoose a un objeto plano de JS
    const user = userDoc.toObject();

    //validar que la contraseña sea correcta
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_PASSWORD);
    }

    //definimos datos que viajaran en el token, en este caso el id y el email del usuario
    const tokenpayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    //generar token
    const token = generateToken(tokenpayload);

    //ocultar la contraseña antes de devolver el usuario
    delete user.password;

    return { user, token };
  }

}

export default UserService;