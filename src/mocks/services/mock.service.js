import { faker } from '@faker-js/faker';

import ProductModel from '../../models/product.model.js';
import OrderModel from '../../models/order.model.js';
import UserModel from '../../models/user.model.js';

import { USER_ROLES } from '../../constants/roles.js';
import { ORDER_STATUS } from '../../constants/order.js';

class MockService {
  // 1. Generar Usuarios y Repartidores
  static generateMockUsers = (count) => {
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
    return await UserModel.insertMany(users);
  };

  // 2. Generar Productos
  static generateMockProducts = (count) => {
    return Array.from({ length: count }, () => ({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      code: faker.string.alphanumeric({ length: 10 }),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 100 }),
      thumbnails: [faker.image.urlLoremFlickr({ category: 'product', width: 640, height: 480 })],
    }));
  };

  static saveMockProducts = async (products) => {
    return await ProductModel.insertMany(products);
  };

  // 3. Generar Órdenes (vinculando usuarios, productos y repartidores/couriers)
  static generateMockOrders = (count, userIds, productIds, courierIds) => {
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
    return await OrderModel.insertMany(orders);
  };
}

export default MockService;