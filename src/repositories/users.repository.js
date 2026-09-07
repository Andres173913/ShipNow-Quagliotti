import UserModel from '../models/user.model.js';

class UserRepository {

  // traer usuarios con paginación y filtros
  static async find(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { ...filter };
    if (options.role) query.role = options.role;
    if (options.search) {
      query.$or = [
        { first_name: { $regex: options.search, $options: 'i' } },
        { last_name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } }
      ];
    }

    const sort = options.sort || { createdAt: -1 };

    const docs = await UserModel.find(query).sort(sort).skip(skip).limit(limit);
    const totalDocs = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    docs.page = page;
    docs.limit = limit;
    docs.totalDocs = totalDocs;
    docs.totalPages = totalPages;
    docs.hasNextPage = page < totalPages;
    docs.hasPrevPage = page > 1;

    return docs;
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