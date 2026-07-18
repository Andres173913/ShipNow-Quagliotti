import OrderModel from '../models/order.model.js';

class OrderRepository {
    // Buscar todas las órdenes
  static async findAll() {
    return await OrderModel.find();
  }

  // Buscar una orden por su ID
  static async findById(id) {
    return await OrderModel.findById(id);
  }

  // Buscar órdenes que necesitan repartidor (Estado READY y sin courier asignado)
  static async findAvailableForCouriers() {
    return await OrderModel.find({ status: 'READY', courierId: null });
  }

  //Actualizar una orden por su ID
  static async update(id, data) {
    return await OrderModel.findByIdAndUpdate(id, data, { new: true });
  }
}

export default OrderRepository;