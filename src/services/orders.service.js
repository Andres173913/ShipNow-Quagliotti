import OrderRepository from '../repositories/orders.repository.js';
import { ORDER_STATUS } from '../constants/order.js';
import { AppError, ERROR_CODES } from '../errors/index.js';

class OrderService {

  // Ver pedidos disponibles en el sistema para reparto
  static async getAvailableOrdersForCourier() {
    return await OrderRepository.findAvailableForCouriers();
  }

  // El Courier acepta/se asigna un pedido
  static async acceptOrder(orderId, courierId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 'El pedido no existe.');
    }

    // La orden debe estar READY y libre
    if (order.status !== ORDER_STATUS.READY || order.courierId !== null) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Este pedido ya no está disponible para ser asignado.');
    }

    // Modificamos el estado y le asignamos el Courier
    return await OrderRepository.update(orderId, {
      courierId: courierId,
      status: ORDER_STATUS.IN_TRANSIT // Pasa automáticamente a "En camino"
    });
  }

  // El Courier entrega el paquete en la puerta del cliente
  static async deliverOrder(orderId, courierId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 'El pedido no existe.');
    }

    // Solo el courier que aceptó el pedido puede marcarlo como entregado
    if (!order.courierId || order.courierId.toString() !== courierId.toString()) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'No estás autorizado para gestionar este pedido.');
    }

    if (order.status !== ORDER_STATUS.IN_TRANSIT) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'El pedido debe estar en tránsito para poder marcarlo como entregado.');
    }

    return await OrderRepository.update(orderId, { status: ORDER_STATUS.DELIVERED });
  }
}

export default OrderService;