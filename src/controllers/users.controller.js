import UserService from '../services/users.service.js';
import { config } from '../config/config.js';

class UserController {
  
  // Obtener todos los usuarios
  static async getAll(req, res, next) {
    try {
      const users = await UserService.getAll();
      res.status(200).json({ status: "success", payload: users });
    } catch (error) {
      next(error); // Delegamos al middleware global
    }
  }

  // Obtener un usuario por id
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getById(id);
      res.status(200).json({ status: "success", payload: user });
    } catch (error) {
      next(error);
    }
  }

  // Obtener un usuario por email
  static async getByEmail(req, res, next) {
    try {
      const { email } = req.query;
      const user = await UserService.getByEmail(email);
      res.status(200).json({ status: "success", payload: user });
    } catch (error) {
      next(error);
    }
  }

  // Crear un usuario
  static async create(req, res, next) {
    try {
      const { first_name, last_name, email, password, role } = req.body;
      const user = await UserService.create({ 
        first_name, 
        last_name, 
        email, 
        password, 
        role 
      });

      res.status(201).json({ status: "success", payload: user });
    } catch (error) {
      next(error);
    } 
  }

  // Actualizar un usuario
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.update(id, req.body);
      res.status(200).json({ status: "success", payload: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar un usuario
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.delete(id);
      res.status(200).json({ status: "success", message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Login de usuario
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await UserService.login(email, password);

      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 4 * 60 * 60 * 1000,
      };

      res.cookie('access_token', token, cookieOptions);

      res.status(200).json({ status: "success", user, token });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;