import ProductRepository from '../repositories/products.repository.js';
import { ERROR_MESSAGES } from '../constants/errors.js';

class ProductService {

    // Método para obtener todos los productos
  static async getAll() {
    return await ProductRepository.find();
  }

  // Método para obtener un producto por su ID, lanzando un error si no existe
  static async getById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  // Método para obtener un producto por su nombre, lanzando un error si no existe
  static async getByName(name) {
    const product = await ProductRepository.findByName(name);
    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  //Metodo para crear un producto, primero validar que no exista otro con el mismo nombre
  static async create(productData) {
    // Evitar nombres duplicados
    const existingProduct = await ProductRepository.findByName(productData.name);
    if (existingProduct) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NAME_ALREADY_EXISTS);
    }

    //Si el producto nace con stock 0, podríamos marcarlo de alguna forma
    // O validar que el precio mínimo sea coherente antes de enviar al repositorio
    return await ProductRepository.create(productData);
  }

  //actualizar un producto, primero validar existencia y luego validar nombre
  static async update(id, data) {
    //Validar existencia
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    //Si se modifica el nombre, validar que no choque con otro existente
    if (data.name && data.name !== product.name) {
      const duplicate = await ProductRepository.findByName(data.name);
      if (duplicate) {
        throw new Error(ERROR_MESSAGES.PRODUCT_NAME_ALREADY_EXISTS);
      }
    }

    return await ProductRepository.update(id, data);
  }

  //eliminar un producto, primero validar existencia
  static async delete(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }
    return await ProductRepository.delete(id);
  }
}

export default ProductService;