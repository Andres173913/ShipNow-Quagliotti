import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import OrderModel from '../../src/models/order.model.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';

describe('Orders Routes Integration Tests', () => {
  let adminUser;
  let courierUser;
  let regularUser;
  let adminToken;
  let courierToken;
  let regularToken;
  let testOrder;

  beforeEach(async () => {
    // 1. Limpiar colecciones
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    // 2. Generar usuarios y productos con MockService
    const [adminData, courierData, userData] = MockService.generateMockUsers(3);
    const [productData] = MockService.generateMockProducts(1);

    // 3. Guardar usuarios en la base de datos
    adminData.role = USER_ROLES.ADMIN;
    adminUser = await UserModel.create(adminData);
    adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });

    courierData.role = USER_ROLES.COURIER;
    courierUser = await UserModel.create(courierData);
    courierToken = generateToken({ id: courierUser._id, email: courierUser.email, role: courierUser.role });

    userData.role = USER_ROLES.USER;
    regularUser = await UserModel.create(userData);
    regularToken = generateToken({ id: regularUser._id, email: regularUser.email, role: regularUser.role });

    const product = await ProductModel.create(productData);

    // 4. Crear la orden directamente adaptada al esquema sin depender del generador masivo
    testOrder = await OrderModel.create({
      userId: regularUser._id,
      products: [{ productId: product._id, quantity: 1 }],
      total: 1000,
      status: 'READY', // O 'pending', según maneje tu enum
      courierId: null    // Libre para ser aceptada
    });
  });

  describe('GET /api/orders/courier/available', () => {
    it('debería permitir a un COURIER ver los pedidos disponibles', async () => {
      const response = await request(app)
        .get('/api/orders/courier/available')
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
      const orders = response.body.payload || response.body;
      expect(orders).to.be.an('array');
    });

    it('debería denegar el acceso a un usuario regular (USER)', async () => {
      const response = await request(app)
        .get('/api/orders/courier/available')
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('PATCH /api/orders/:id/accept', () => {
    it('debería permitir a un COURIER aceptar un pedido', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testOrder._id}/accept`)
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
    });
  });

  describe('PATCH /api/orders/:id/deliver', () => {
    it('debería permitir a un COURIER marcar un pedido como entregado', async () => {
      // Primero aceptamos la orden con el courier
      await request(app)
        .patch(`/api/orders/${testOrder._id}/accept`)
        .set('Cookie', [`access_token=${courierToken}`]);

      // Luego la marcamos como entregada
      const response = await request(app)
        .patch(`/api/orders/${testOrder._id}/deliver`)
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
    });
  });

});