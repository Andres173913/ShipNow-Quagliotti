import ProductModel from '../models/product.model.js';

class ProductRepository {
    // Método para obtener todos los productos
  static async find() {
    return await ProductModel.find();
  }

  // Método para obtener un producto por su ID
  static async findById(id) {
    return await ProductModel.findById(id);
  }

  // Método para obtener un producto por su nombre
  static async findByName(name) {
    return await ProductModel.findOne({ name });
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