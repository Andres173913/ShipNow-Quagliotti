import OrderRepository from '../repositories/orders.repository.js';
import { ORDER_STATUS } from '../constants/order.js';
import { ERROR_MESSAGES } from '../constants/errors.js';

class OrderService {

  //Ver pedidos disponibles en el sistema para reparto
  static async getAvailableOrdersForCourier() {
    return await OrderRepository.findAvailableForCouriers();
  }

  //El Courier acepta/se asigna un pedido
  static async acceptOrder(orderId, courierId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new Error('El pedido no existe.');

    //La orden debe estar READY y libre
    if (order.status !== ORDER_STATUS.READY || order.courierId !== null) {
      throw new Error('Este pedido ya no está disponible para ser asignado.');
    }

    // Modificamos el estado y le asignamos el Courier
    return await OrderRepository.update(orderId, {
      courierId: courierId,
      status: ORDER_STATUS.IN_TRANSIT // Pasa automáticamente a "En camino"
    });
  }

  //El Courier entrega el paquete en la puerta del cliente
  static async deliverOrder(orderId, courierId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new Error('El pedido no existe.');

    //Solo el courier que aceptó el pedido puede marcarlo como entregado
    if (order.courierId.toString() !== courierId.toString()) {
      throw new Error('No estás autorizado para gestionar este pedido.');
    }

    if (order.status !== ORDER_STATUS.IN_TRANSIT) {
      throw new Error('El pedido debe estar en tránsito para poder marcarlo como entregado.');
    }

    return await OrderRepository.update(orderId, { status: ORDER_STATUS.DELIVERED });
  }
}

export default OrderService;