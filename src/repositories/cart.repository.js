import { CartModel } from '../models/cart.model.js';

class CartRepository {
  
  // Buscar carrito por usuario y popular sus productos
  static async findByUserId(userId) {
    return await CartModel.findOne({ userId }).populate('products.productId');
  }

  // Crear un carrito nuevo
  static async create(data) {
    return await CartModel.create(data);
  }

  // Guardar cambios en un carrito existente
  static async save(cart) {
    return await cart.save();
  }

  // Actualizar directamente (por ejemplo, para vaciarlo)
  static async findOneAndUpdate(filter, update, options) {
    return await CartModel.findOneAndUpdate(filter, update, options).populate('products.productId');
  }
}

export default CartRepository;