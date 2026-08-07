import CartRepository from '../repositories/cart.repository.js';
import ProductRepository from '../repositories/products.repository.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import logger from '../config/logger.js';

class CartService {
  
  static async getCartByUserId(userId) {
    let cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      logger.info(`Creando un nuevo carrito vacío para el usuario: ${userId}`);
      cart = await CartRepository.create({ userId, products: [] });
      cart = await CartRepository.findByUserId(userId);
    }
    return cart;
  }

  static async addProductToCart(userId, productId, quantity = 1) {
    // Usamos ProductRepository en lugar de ProductModel directamente
    const product = await ProductRepository.findById(productId);
    if (!product) {
      logger.warn(`⚠️ Intento de agregar producto fallido: Producto con ID ${productId} no encontrado.`);
      throw new AppError(ERROR_CODES.NOT_FOUND, 'El producto no existe.');
    }

    if (product.stock < quantity) {
      logger.warn(`⚠️ Intento de agregar producto fallido: Stock insuficiente para el producto ${product.title}.`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Stock insuficiente para el producto solicitado.');
    }

    let cart = await CartRepository.findByUserId(userId);

    if (!cart) {
      cart = await CartRepository.create({
        userId,
        products: [{ productId, quantity }]
      });
      cart = await CartRepository.findByUserId(userId);
    } else {
      const productIndex = cart.products.findIndex(
        p => (p.productId._id ? p.productId._id.toString() : p.productId.toString()) === productId
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      await CartRepository.save(cart);
      cart = await CartRepository.findByUserId(userId);
    }

    logger.info(`Producto ${productId} agregado al carrito del usuario ${userId}`);
    return cart;
  }

  static async clearCart(userId) {
    const cart = await CartRepository.findOneAndUpdate(
      { userId },
      { products: [] },
      { new: true }
    );
    
    if (!cart) {
      logger.warn(`⚠️ Intento de vaciar carrito fallido: Carrito para el usuario ${userId} no encontrado.`);
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Carrito no encontrado.');
    }

    logger.info(`Carrito vaciado para el usuario ${userId}`);
    return cart;
  }
}

export default CartService;