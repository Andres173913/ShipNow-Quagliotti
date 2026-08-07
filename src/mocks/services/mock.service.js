import { faker } from '@faker-js/faker';

import ProductModel from '../../models/product.model.js';
import OrderModel from '../../models/order.model.js';
import UserModel from '../../models/user.model.js';

import { USER_ROLES } from '../../constants/roles.js';
import { ORDER_STATUS } from '../../constants/order.js';
import { AppError, ERROR_CODES } from '../../errors/index.js';
import logger from '../../config/logger.js';

class MockService {
  // Generar Usuarios y Repartidores
  static generateMockUsers = (count) => {
    logger.debug(`Generando ${count} usuarios mock en memoria...`);
    const roles = Object.values(USER_ROLES);
    return Array.from({ length: count }, () => ({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(roles),
    }));
  };

  static saveMockUsers = async (users) => {
    try {
      const result = await UserModel.insertMany(users);
      logger.info(`Se guardaron exitosamente ${result.length} usuarios mock en la base de datos.`);
      return result;
    } catch (error) {
      logger.error(`Error al insertar usuarios simulados en MongoDB: ${error.message}`);
      throw new AppError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        `Falla al insertar usuarios simulados en MongoDB: ${error.message}`
      );
    }
  };

  // Generar Productos
  static generateMockProducts = (count) => {
    logger.debug(`Generando ${count} productos mock en memoria...`);
    return Array.from({ length: count }, () => ({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      code: faker.string.alphanumeric({ length: 10 }),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 100 }),
      thumbnails: [faker.image.url({ category: 'product', width: 640, height: 480 })],
    }));
  };

  static saveMockProducts = async (products) => {
    try {
      const result = await ProductModel.insertMany(products);
      logger.info(`Se guardaron exitosamente ${result.length} productos mock en la base de datos.`);
      return result;
    } catch (error) {
      logger.error(`Error al insertar productos simulados en MongoDB: ${error.message}`);
      throw new AppError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        `Falla al insertar productos simulados en MongoDB: ${error.message}`
      );
    }
  };

  // Generar Órdenes (vinculando usuarios, productos y repartidores/couriers)
  static generateMockOrders = (count, userIds, productIds, courierIds) => {
    logger.debug(`Generando ${count} órdenes mock en memoria...`);
    const statuses = Object.values(ORDER_STATUS);

    return Array.from({ length: count }, () => {
      const randomUserId = faker.helpers.arrayElement(userIds);
      const numProducts = faker.number.int({ min: 1, max: 3 });
      let total = 0;

      const orderProducts = Array.from({ length: numProducts }, () => {
        const randomProductId = faker.helpers.arrayElement(productIds);
        const quantity = faker.number.int({ min: 1, max: 5 });
        const price = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
        total += price * quantity;

        return { productId: randomProductId, quantity };
      });

      return {
        userId: randomUserId,
        products: orderProducts,
        total: parseFloat(total.toFixed(2)),
        status: faker.helpers.arrayElement(statuses),
        courierId: courierIds.length > 0 && Math.random() > 0.5 ? faker.helpers.arrayElement(courierIds) : null,
      };
    });
  };

  static saveMockOrders = async (orders) => {
    try {
      const result = await OrderModel.insertMany(orders);
      logger.info(`Se guardaron exitosamente ${result.length} órdenes mock en la base de datos.`);
      return result;
    } catch (error) {
      logger.error(`Error al insertar órdenes simuladas en MongoDB: ${error.message}`);
      throw new AppError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        `Falla al insertar órdenes simuladas en MongoDB: ${error.message}`
      );
    }
  };

  // Método auxiliar para obtener datos previos de la BD (asistiendo al controller de mocks)
  static async getBaseDataForOrders() {
    const users = await UserModel.find({}, '_id role');
    const products = await ProductModel.find({}, '_id');

    if (users.length === 0 || products.length === 0) {
      logger.warn('Intento fallido de generar órdenes mock: faltan usuarios o productos previos en la BD.');
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'Se requieren usuarios y productos previos en la BD para simular órdenes.'
      );
    }

    const userIds = users.map(u => u._id);
    const productIds = products.map(p => p._id);
    const courierIds = users.filter(u => u.role === USER_ROLES.COURIER).map(c => c._id);

    return { userIds, productIds, courierIds };
  }
}

export default MockService;