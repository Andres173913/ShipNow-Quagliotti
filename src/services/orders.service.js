import OrderRepository from '../repositories/orders.repository.js';
import { ORDER_STATUS } from '../constants/order.js';
import { AppError, ERROR_CODES } from '../errors/index.js';
import logger from '../config/logger.js'; 

class OrderService {

  // Ver pedidos disponibles en el sistema para reparto
  static async getAvailableOrdersForCourier() {
    return await OrderRepository.findAvailableForCouriers();
  }

  // El Courier acepta/se asigna un pedido
  static async acceptOrder(orderId, courierId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      logger.warn(`⚠️ Intento de aceptación fallido: Pedido ID ${orderId} no existe.`);
      throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 'El pedido no existe.');
    }

    // La orden debe estar READY y libre
    if (order.status !== ORDER_STATUS.READY || order.courierId !== null) {
      logger.warn(`⚠️ Intento de asignación rechazada: El pedido ID ${orderId} ya no está disponible (Estado: ${order.status}, Courier actual: ${order.courierId})`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Este pedido ya no está disponible para ser asignado.');
    }

    // Modificamos el estado y le asignamos el Courier
    const updatedOrder = await OrderRepository.update(orderId, {
      courierId: courierId,
      status: ORDER_STATUS.IN_TRANSIT // Pasa automáticamente a "En camino"
    });

    logger.info(`🚚 Pedido ID ${orderId} asignado exitosamente al courier ${courierId} (Estado: IN_TRANSIT)`);

    return updatedOrder;
  }

  // El Courier entrega el paquete en la puerta del cliente
  static async deliverOrder(orderId, courierId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      logger.warn(`⚠️ Intento de entrega fallido: Pedido ID ${orderId} no existe.`);
      throw new AppError(ERROR_CODES.ORDER_NOT_FOUND, 'El pedido no existe.');
    }

    // Solo el courier que aceptó el pedido puede marcarlo como entregado
    if (!order.courierId || order.courierId.toString() !== courierId.toString()) {
      logger.warn(`⛔ Acceso denegado: El courier ${courierId} intentó entregar el pedido ID ${orderId} asignado a otro courier (${order.courierId})`);
      throw new AppError(ERROR_CODES.FORBIDDEN, 'No estás autorizado para gestionar este pedido.');
    }

    if (order.status !== ORDER_STATUS.IN_TRANSIT) {
      logger.warn(`⚠️ Intento de entrega inválido: El pedido ID ${orderId} no está en tránsito (Estado actual: ${order.status})`);
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'El pedido debe estar en tránsito para poder marcarlo como entregado.');
    }

    const deliveredOrder = await OrderRepository.update(orderId, { status: ORDER_STATUS.DELIVERED });
    
    logger.info(`✅ Pedido ID ${orderId} entregado con éxito por el courier ${courierId}`);

    return deliveredOrder;
  }
}

export default OrderService;