import MockService from '../services/mock.service.js';
import UserModel from '../../models/user.model.js';
import ProductModel from '../../models/product.model.js';
import { USER_ROLES } from '../../constants/roles.js';

class MockController {
  // Obtener usuarios simulados (sin guardar)
  static async getMockUsers(req, res) {
    try {
      const count = parseInt(req.query.count);

      //Validar que exista y sea positivo y menor a 50
      if ( !count || isNaN(count) || count <= 0 || count > 50) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'El número a generar debe ser un valor positivo menor o igual a 50.' 
        });
      }

      const users = MockService.generateMockUsers(count);
      return res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Obtener productos simulados (sin guardar)
  static async getMockProducts(req, res) {
    try {
      const count = parseInt(req.query.count);

      //Validar que exista y sea positivo y menor a 20
      if (!count ||isNaN(count) || count <= 0) {
        return res.status(400).json({ status: 'error', message: 'El parámetro count debe ser mayor a 0.' });
      }

      const products = MockService.generateMockProducts(count);
      return res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Obtener órdenes simuladas (sin guardar, usando IDs reales de la BD)
  static async getMockOrders(req, res) {
    try {
      const users = await UserModel.find({}, '_id role');
      const products = await ProductModel.find({}, '_id');

      if (users.length === 0 || products.length === 0) {
        return res.status(400).json({ 
          error: 'Se requieren usuarios y productos previos en la BD para simular órdenes.' 
        });
      }

      const userIds = users.map(u => u._id);
      const productIds = products.map(p => p._id);
      const courierIds = users.filter(u => u.role === USER_ROLES.COURIER).map(c => c._id);

      const count = parseInt(req.query.count);

      if (!count ||isNaN(count) || count <= 0 || count > 10) {
        return res.status(400).json({ status: 'error', message: 'El parámetro count debe ser mayor a 0 y menor a 10.' });
      }

      const orders = MockService.generateMockOrders(count, userIds, productIds, courierIds);
      
      return res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Inserción masiva controlada en MongoDB (Seed) sin valores hardcodeados
  static async generateAndSaveData(req, res) {
    try {
      // Extraemos los valores dinámicamente desde el body (con valores por defecto opcionales si no se envían)
      const usersCount = parseInt(req.body.usersCount);
      const productsCount = parseInt(req.body.productsCount);
      const ordersCount = parseInt(req.body.ordersCount);

      //Validar que existan y sean numeros
      if (!usersCount || !productsCount || !ordersCount || isNaN(usersCount) || isNaN(productsCount) || isNaN(ordersCount)) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Debes proporcionar usersCount, productsCount y ordersCount válidos en el body.' 
        });
      }

      //Validar que sea positivo y menor a 50
      if (usersCount <= 0 || usersCount > 50){
         return res.status (400).json ({
            status: 'error',
            message: 'userCount debe ser positivo y menor a 50'
         })
      }

      //Validar que sea positivo y menor a 50
       if (productsCount <= 0 || productsCount > 50){
         return res.status (400).json ({
            status: 'error',
            message: 'productsCount debe ser positivo y menor a 50'
         })
      }     

      //Validar que sea positivo y menor a 50
       if (ordersCount <= 0 || ordersCount > 50){
         return res.status (400).json ({
            status: 'error',
            message: 'ordersCount debe ser positivo y menor a 50'
         })
      } 

      // 1. Generar y guardar usuarios
      const mockUsers = MockService.generateMockUsers(usersCount);
      const insertedUsers = await MockService.saveMockUsers(mockUsers);

      // 2. Generar y guardar productos
      const mockProducts = MockService.generateMockProducts(productsCount);
      const insertedProducts = await MockService.saveMockProducts(mockProducts);

      // Obtener IDs y filtrar repartidores
      const userIds = insertedUsers.map(u => u._id);
      const productIds = insertedProducts.map(p => p._id);
      const courierIds = insertedUsers.filter(u => u.role === USER_ROLES.COURIER).map(c => c._id);

      // 3. Generar y guardar órdenes
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
      console.error('Error generating and saving mock data:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export default MockController;