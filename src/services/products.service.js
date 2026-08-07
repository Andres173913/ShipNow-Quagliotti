import ProductRepository from '../repositories/products.repository.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import logger from '../config/logger.js';

class ProductService {

  // Método para obtener todos los productos
  static async getAll() {
    return await ProductRepository.find();
  }

  // Método para obtener un producto por su ID, lanzando un error si no existe
  static async getById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      logger.warn(`⚠️ Producto no encontrado por ID: ${id}`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  // Método para obtener un producto por su título, lanzando un error si no existe
  static async getByTitle(title) {
    const product = await ProductRepository.findByTitle(title);
    if (!product) {
      logger.warn(`⚠️ Producto no encontrado por título: ${title}`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  // Método para crear un producto, primero validar que no exista otro con el mismo título
  static async create(productData) {
    // Evitar títulos duplicados
    const existingProduct = await ProductRepository.findByTitle(productData.title);
    if (existingProduct) {
      logger.warn(`⚠️ Intento de creación fallido: Ya existe un producto con el título '${productData.title}'`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Ya existe un producto registrado con ese título.');
    }

    const newProduct = await ProductRepository.create(productData);
    logger.info(`📦 Producto creado exitosamente: '${newProduct.title}' (ID: ${newProduct._id})`);
    
    return newProduct;
  }

  // Actualizar un producto, primero validar existencia y luego validar título
  static async update(id, data) {
    // Validar existencia
    const product = await ProductRepository.findById(id);
    if (!product) {
      logger.warn(`⚠️ Intento de actualización fallido: Producto con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    // Si se modifica el título, validar que no choque con otro existente
    if (data.title && data.title !== product.title) {
      const duplicate = await ProductRepository.findByTitle(data.title);
      if (duplicate) {
        logger.warn(`⚠️ Intento de actualización fallido: El título '${data.title}' ya pertenece a otro producto.`);
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Ya existe otro producto registrado con ese título.');
      }
    }

    const updatedProduct = await ProductRepository.update(id, data);
    logger.info(`🔄 Producto actualizado exitosamente: ID ${id}, Título: ${updatedProduct.title}`);
    
    return updatedProduct;
  }

  // Eliminar un producto, primero validar existencia
  static async delete(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      logger.warn(`⚠️ Intento de eliminación fallido: Producto con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    const deletedProduct = await ProductRepository.delete(id);
    logger.info(`🗑️ Producto eliminado: ID ${id} ('${product.title}')`);
    
    return deletedProduct;
  }
}

export default ProductService;