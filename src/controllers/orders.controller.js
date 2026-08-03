import OrderService from '../services/orders.service.js';

class OrderController {

  // Órdenes disponibles para que los Couriers puedan aceptarlas
  static async getAvailable(req, res, next) {
    try {
      const orders = await OrderService.getAvailableOrdersForCourier();
      res.status(200).json({ status: "success", payload: orders });
    } catch (error) {
      next(error);
    }
  }

  // Orden que el Courier acepta y se le asigna
  static async accept(req, res, next) {
    try {
      const { id } = req.params;
      const courierId = req.user.id; // Extraído de forma segura desde el Token JWT

      const updatedOrder = await OrderService.acceptOrder(id, courierId);
      res.status(200).json({ status: "success", message: 'Pedido asignado con éxito', order: updatedOrder });
    } catch (error) {
      next(error);
    }
  }

  // Orden que el Courier entrega en la puerta del cliente
  static async deliver(req, res, next) {
    try {
      const { id } = req.params;
      const courierId = req.user.id; // Extraído de forma segura desde el Token JWT

      const updatedOrder = await OrderService.deliverOrder(id, courierId);
      res.status(200).json({ status: "success", message: 'Pedido marcado como entregado', order: updatedOrder });
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;