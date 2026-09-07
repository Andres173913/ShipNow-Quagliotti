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

  // Buscar órdenes que necesitan repartidor (Estado READY y sin courier asignado) con paginación
  static async findAvailableForCouriers(options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { status: 'READY', $or: [{ courierId: null }, { courier: null }] };

    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalDocs = await OrderModel.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    docs.page = page;
    docs.limit = limit;
    docs.totalDocs = totalDocs;
    docs.totalPages = totalPages;
    docs.hasNextPage = page < totalPages;
    docs.hasPrevPage = page > 1;

    return docs;
  }

  //Actualizar una orden por su ID
  static async update(id, data) {
    const updateData = { ...data };
    if (updateData.courierId && !updateData.courier) updateData.courier = updateData.courierId;
    if (updateData.courier && !updateData.courierId) updateData.courierId = updateData.courier;
    return await OrderModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
  }
}

export default OrderRepository;