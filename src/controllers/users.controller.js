import UserService from '../services/users.service.js';
import {config} from '../config/config.js';

class UserController {
  
  // Obtener todos los usuarios
  static async getAll(req, res) {
    try {
      const users = await UserService.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.warn('Error getting users');
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  }

  // Obtener un usuario por id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getById(id);
      res.status(200).json(user);
    } catch (error) {
      console.warn('Error getting user');
      res.status(404).json({ statusCode: 404, message: error.message });
    }
  }

  // Obtener un usuario por email
  static async getByEmail(req, res) {
    try {
      const { email } = req.query;
      const user = await UserService.getByEmail(email);
      res.status(200).json(user);
    } catch (error) {
      console.warn('Error getting user');
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  }

  // crear un usuario
  static async create(req, res) {
    try {
      const { first_name, last_name, email, password, role } = req.body;
      const user = await UserService.create({ 
        first_name, 
        last_name, 
        email, 
        password, 
        role 
      });

      res.status(201).json(user);
    } catch (error) {
      console.warn('Error creating user');
      res.status(400).json({ statusCode: 400, message: error.message });
    } 
  }

  // actualizar un usuario
  static async update(req, res) {
    try {
      // Obtener el id del usuario a actualizar
      const { id } = req.params;
      const UpdateUser = await UserService.update(id, req.body);
      res.status(200).json(UpdateUser);
    } catch (error) {
      console.warn('Error updating user');
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }

  // eliminar un usuario
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await UserService.delete(id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.warn('Error deleting user');
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }

  // login de usuario
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      //Destructuramos lo que nos llega del servicio de login, que es un token
      const {user, token }= await UserService.login(email, password);

      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production', // Solo se enviará la cookie a través de HTTPS en producción
        sameSite: 'strict', // Evita que la cookie sea enviada en solicitudes de sitios cruzados
        maxAge: 4 * 60 * 60 * 1000, // La cookie expirará en 1 día
        sameSite: 'lax', // Permite que la cookie sea enviada en solicitudes de sitios cruzados
      };

      res.cookie('access_token', token, cookieOptions);

      res.status(200).json({ user, token });
    } catch (error) {
      console.warn('Error logging in user');
      res.status(401).json({ statusCode: 401, message: error.message });
    }
  }
}
export default UserController;