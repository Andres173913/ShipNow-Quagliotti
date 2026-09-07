import ProductRepository from '../repositories/products.repository.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import logger from '../config/logger.js';

class ProductService {

  // Método para obtener productos con paginación y filtros
  static async getAll(params = {}) {
    return await ProductRepository.find({}, params);
  }

  // Método para obtener un producto por su ID
  static async getById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      logger.warn(`⚠️ Producto no encontrado por ID: ${id}`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  // Método para obtener un producto por su título
  static async getByTitle(title) {
    const product = await ProductRepository.findByTitle(title);
    if (!product) {
      logger.warn(`⚠️ Producto no encontrado por título: ${title}`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  // Método para crear un producto
  static async create(productData) {
    if (!productData || !productData.title || !productData.description || !productData.price || !productData.code || !productData.category) {
      logger.warn(`⚠️ Intento de creación fallido: Faltan campos obligatorios para el producto.`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Todos los campos obligatorios (title, description, price, code, category) deben estar completos.');
    }

    const existingProduct = await ProductRepository.findByTitle(productData.title);
    if (existingProduct) {
      logger.warn(`⚠️ Intento de creación fallido: Ya existe un producto con el título '${productData.title}'`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Ya existe un producto registrado con ese título.');
    }

    const newProduct = await ProductRepository.create(productData);
    logger.info(`📦 Producto creado exitosamente: '${newProduct.title}' (ID: ${newProduct._id})`);

    return newProduct;
  }

  // Actualizar un producto
  static async update(id, data) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      logger.warn(`⚠️ Intento de actualización fallido: Producto con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

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

  // Eliminar un producto
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

  // Método para agregar la ruta de la imagen procesada por Multer al array de thumbnails
  static async addThumbnail(id, file) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      logger.warn(`⚠️ Intento de subida de imagen fallido: Producto con ID ${id} no encontrado.`);
      throw new AppError(ERROR_CODES.PRODUCT_NOT_FOUND);
    }

    if (!file) {
      logger.warn(`⚠️ Intento de subida fallido: No se adjuntó archivo para el producto ${id}.`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Es necesario adjuntar una imagen.');
    }

    const thumbnailObj = typeof file === 'string'
      ? { originalName: 'image.jpg', generatedName: 'image.jpg', path: file, mimetype: 'image/jpeg', size: 0, documentType: 'image' }
      : {
          originalName: file.originalname || file.originalName || file.filename || 'image.jpg',
          generatedName: file.filename || file.generatedName || 'image.jpg',
          path: file.path || `/uploads/${file.filename || 'image.jpg'}`,
          mimetype: file.mimetype || 'image/jpeg',
          size: file.size || 0,
          documentType: 'image'
        };

    const updatedProduct = await ProductRepository.update(id, {
      $push: { thumbnails: thumbnailObj }
    });

    logger.info(`🖼️ Imagen agregada exitosamente al producto ID: ${id}`);

    return updatedProduct;
  }
}

export default ProductService;