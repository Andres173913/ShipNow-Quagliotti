import OrderService from '../services/orders.service.js';

class OrderController {

  // Órdenes disponibles para que los Couriers puedan aceptarlas con paginación
  static async getAvailable(req, res, next) {
    try {
      const { page, limit } = req.query || {};
      const orders = await OrderService.getAvailableOrdersForCourier({ page, limit });

      res.status(200).json({
        status: "success",
        payload: orders,
        page: orders.page,
        limit: orders.limit,
        totalDocs: orders.totalDocs,
        totalPages: orders.totalPages,
        hasNextPage: orders.hasNextPage,
        hasPrevPage: orders.hasPrevPage
      });
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

  //Subir comprobante o recibo asociado a una orden
  static async uploadReceipt(req, res, next) {
    try {
      const { id } = req.params;
      const file = req.file;

      const updatedOrder = await OrderService.uploadReceipt(id, file);
      res.status(200).json({ status: "success", message: 'Comprobante subido y asociado con éxito', order: updatedOrder });
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;