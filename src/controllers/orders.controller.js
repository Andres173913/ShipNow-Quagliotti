import OrderService from '../services/orders.service.js';

class OrderController {

  //Ordenes disponibles para que los Couriers puedan aceptarlas
  static async getAvailable(req, res) {
    try {
      const orders = await OrderService.getAvailableOrdersForCourier();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  }

  //Orden que el Courier acepta y se le asigna
  static async accept(req, res) {
    try {
      const { id } = req.params;
      const courierId = req.user.id; // Extraído de forma segura desde el Token JWT

      const updatedOrder = await OrderService.acceptOrder(id, courierId);
      res.status(200).json({ message: 'Pedido asignado con éxito', order: updatedOrder });
    } catch (error) {
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }

  //Orden que el Courier entrega en la puerta del cliente
  static async deliver(req, res) {
    try {
      const { id } = req.params;
      const courierId = req.user.id; // Extraído de forma segura desde el Token JWT

      const updatedOrder = await OrderService.deliverOrder(id, courierId);
      res.status(200).json({ message: 'Pedido marcado como entregado', order: updatedOrder });
    } catch (error) {
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }
}

export default OrderController;