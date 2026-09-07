import ProductModel from '../models/product.model.js';

class ProductRepository {
  // Método para obtener todos los productos con paginación y filtros
  static async find(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { ...filter };
    if (options.category) query.category = options.category;
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.price = {};
      if (options.minPrice !== undefined) query.price.$gte = Number(options.minPrice);
      if (options.maxPrice !== undefined) query.price.$lte = Number(options.maxPrice);
    }
    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } }
      ];
    }

    const sort = options.sort || { createdAt: -1 };

    const docs = await ProductModel.find(query).sort(sort).skip(skip).limit(limit);
    const totalDocs = await ProductModel.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    docs.page = page;
    docs.limit = limit;
    docs.totalDocs = totalDocs;
    docs.totalPages = totalPages;
    docs.hasNextPage = page < totalPages;
    docs.hasPrevPage = page > 1;

    return docs;
  }

  // Método para obtener un producto por su ID
  static async findById(id) {
    return await ProductModel.findById(id);
  }

  // Método para obtener un producto por su título
  static async findByTitle(title) {
    return await ProductModel.findOne({ title });
  }

  // Método para crear un nuevo producto
  static async create(data) {
    return await ProductModel.create(data);
  }

  // Método para actualizar un producto existente
  static async update(id, data) {
    return await ProductModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  // Método para eliminar un producto por su ID
  static async delete(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}

export default ProductRepository;