import MockService from '../services/mock.service.js';
import { AppError, ERROR_CODES } from '../../errors/index.js';

class MockController {
  
  static async getMockUsers(req, res, next) {
    try {
      const count = parseInt(req.query.count);
      if (!count || isNaN(count) || count <= 0 || count > 50) {
        throw new AppError(ERROR_CODES.INVALID_MOCK_AMOUNT, 'El número de usuarios debe ser positivo y menor o igual a 50.');
      }
      const users = MockService.generateMockUsers(count);
      return res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      next(error);
    }
  }

  static async getMockProducts(req, res, next) {
    try {
      const count = parseInt(req.query.count);
      if (!count || isNaN(count) || count <= 0) {
        throw new AppError(ERROR_CODES.INVALID_MOCK_AMOUNT, 'El parámetro count para productos debe ser mayor a 0.');
      }
      const products = MockService.generateMockProducts(count);
      return res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
      next(error);
    }
  }

  static async getMockOrders(req, res, next) {
    try {
      const { userIds, productIds, courierIds } = await MockService.getBaseDataForOrders();
      const count = parseInt(req.query.count);

      if (!count || isNaN(count) || count <= 0 || count > 10) {
        throw new AppError(ERROR_CODES.INVALID_MOCK_AMOUNT, 'El count para órdenes debe ser mayor a 0 y menor a 10.');
      }

      const orders = MockService.generateMockOrders(count, userIds, productIds, courierIds);
      return res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
      next(error);
    }
  }

  static async generateAndSaveData(req, res, next) {
    try {
      const usersCount = parseInt(req.body.usersCount);
      const productsCount = parseInt(req.body.productsCount);
      const ordersCount = parseInt(req.body.ordersCount);

      if (!usersCount || !productsCount || !ordersCount || isNaN(usersCount) || isNaN(productsCount) || isNaN(ordersCount)) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Debes proporcionar usersCount, productsCount y ordersCount válidos en el body.');
      }

      if (usersCount <= 0 || usersCount > 50 || productsCount <= 0 || productsCount > 50 || ordersCount <= 0 || ordersCount > 50) {
        throw new AppError(ERROR_CODES.INVALID_MOCK_AMOUNT, 'Las cantidades deben ser positivas y menores o iguales a 50.');
      }

      const mockUsers = MockService.generateMockUsers(usersCount);
      const insertedUsers = await MockService.saveMockUsers(mockUsers);

      const mockProducts = MockService.generateMockProducts(productsCount);
      const insertedProducts = await MockService.saveMockProducts(mockProducts);

      const userIds = insertedUsers.map(u => u._id);
      const productIds = insertedProducts.map(p => p._id);
      const courierIds = insertedUsers.filter(u => u.role === 'courier').map(c => c._id);

      const mockOrders = MockService.generateMockOrders(ordersCount, userIds, productIds, courierIds);
      const insertedOrders = await MockService.saveMockOrders(mockOrders);

      return res.status(201).json({
        status: 'success',
        message: 'Datos de prueba generados e insertados correctamente en MongoDB.',
        stats: {
          usersCreated: insertedUsers.length,
          productsCreated: insertedProducts.length,
          ordersCreated: insertedOrders.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MockController;