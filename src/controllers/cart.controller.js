import CartService from '../services/cart.service.js';
import logger from '../config/logger.js';

class CartController {
  
  static async getCart(req, res, next) {
    try {
      const userId = req.user.id; 
      const cart = await CartService.getCartByUserId(userId);
      
      return res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
      logger.error(`Error al obtener el carrito: ${error.message}`);
      next(error);
    }
  }

  static async addProduct(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      const updatedCart = await CartService.addProductToCart(userId, productId, quantity);
      
      return res.status(200).json({
        status: 'success',
        message: 'Producto agregado al carrito exitosamente',
        payload: updatedCart
      });
    } catch (error) {
      logger.error(`Error al agregar producto al carrito: ${error.message}`);
      next(error);
    }
  }

  static async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      const clearedCart = await CartService.clearCart(userId);

      return res.status(200).json({
        status: 'success',
        message: 'Carrito vaciado correctamente',
        payload: clearedCart
      });
    } catch (error) {
      logger.error(`Error al vaciar el carrito: ${error.message}`);
      next(error);
    }
  }
}

export default CartController;