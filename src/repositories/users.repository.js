import UserModel from '../models/user.model.js';

class UserRepository {

  //traer todos los usuarios
  static async find() {
    return await UserModel.find();
  }
  
  //traer un usuario por id
  static async findById(id) {
    return await UserModel.findById(id);
  }

  //traer un usuario por email
  static async findByEmail(email, includePassword = false) {
    return await UserModel.findOne({ email }, includePassword ? '+password' : '');
  }

  //crear un usuario
  static async create(data) {
    return await UserModel.create(data);
  }

  //actualizar un usuario
  static async update(id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  //eliminar un usuario
  static async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }
}
export default UserRepository;