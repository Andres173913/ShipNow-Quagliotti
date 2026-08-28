import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import OrderModel from '../../src/models/order.model.js';
import ProductModel from '../../src/models/product.model.js';
import UserModel from '../../src/models/user.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';
import { ORDER_STATUS } from '../../src/constants/order.js';

describe('Orders Routes Integration Tests', () => {
  let adminUser;
  let courierUser;
  let regularUser;
  let adminToken;
  let courierToken;
  let regularToken;
  let sampleOrder;
  let sampleProduct;

  beforeEach(async () => {
    // Limpiar colecciones
    await OrderModel.deleteMany({});
    await ProductModel.deleteMany({});
    await UserModel.deleteMany({});

    // Crear usuario administrador
    const adminData = MockService.generateMockUsers(1)[0];
    adminData.role = USER_ROLES.ADMIN;
    adminData.password = 'Password123!';
    adminUser = await UserModel.create(adminData);
    adminToken = generateToken({
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Crear usuario courier
    const courierData = MockService.generateMockUsers(1)[0];
    courierData.role = USER_ROLES.COURIER;
    courierData.password = 'Password123!';
    courierUser = await UserModel.create(courierData);
    courierToken = generateToken({
      id: courierUser._id,
      email: courierUser.email,
      role: courierUser.role
    });

    // Crear usuario regular
    const regularData = MockService.generateMockUsers(1)[0];
    regularData.role = USER_ROLES.USER;
    regularData.password = 'Password123!';
    regularUser = await UserModel.create(regularData);
    regularToken = generateToken({
      id: regularUser._id,
      email: regularUser.email,
      role: regularUser.role
    });

    // Crear producto y orden de prueba
    const products = MockService.generateMockProducts(1);
    sampleProduct = await ProductModel.create(products[0]);

    sampleOrder = await OrderModel.create({
      client: regularUser._id,
      products: [{ productId: sampleProduct._id, quantity: 1 }],
      total_price: 500,
      delivery_address: 'Av. Corrientes 1234',
      status: ORDER_STATUS.READY,
      courier: null,
      courierId: null
    });
  });

  describe('GET /api/orders/courier/available', () => {
    it('debería permitir a un COURIER listar pedidos disponibles', async () => {
      const response = await request(app)
        .get('/api/orders/courier/available')
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
      const ordersList = response.body.payload || response.body;
      expect(ordersList).to.be.an('array');
    });

    it('debería permitir a un ADMIN listar pedidos disponibles para couriers', async () => {
      const response = await request(app)
        .get('/api/orders/courier/available')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(200);
    });

    it('debería denegar el acceso si el usuario es un USER regular', async () => {
      const response = await request(app)
        .get('/api/orders/courier/available')
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('PATCH /api/orders/:id/accept', () => {
    it('debería permitir a un COURIER aceptar una orden', async () => {
      const response = await request(app)
        .patch(`/api/orders/${sampleOrder._id}/accept`)
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
    });

    it('debería denegar la aceptación de orden a un usuario regular', async () => {
      const response = await request(app)
        .patch(`/api/orders/${sampleOrder._id}/accept`)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('PATCH /api/orders/:id/deliver', () => {
    it('debería permitir a un COURIER marcar una orden como entregada', async () => {
      await OrderModel.findByIdAndUpdate(sampleOrder._id, {
        status: ORDER_STATUS.IN_TRANSIT,
        courier: courierUser._id,
        courierId: courierUser._id
      });

      const response = await request(app)
        .patch(`/api/orders/${sampleOrder._id}/deliver`)
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
    });

    it('debería denegar marcar como entregado si el usuario no tiene permisos de courier o admin', async () => {
      const response = await request(app)
        .patch(`/api/orders/${sampleOrder._id}/deliver`)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('POST /api/orders/:id/receipt', () => {
    it('debería permitir a un COURIER subir un comprobante o recibo', async () => {
      const response = await request(app)
        .post(`/api/orders/${sampleOrder._id}/receipt`)
        .set('Cookie', [`access_token=${courierToken}`])
        .attach('receipt', Buffer.from('contenido del recibo'), 'receipt.pdf');

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('debería denegar la subida de recibo si el usuario es un USER regular', async () => {
      const response = await request(app)
        .post(`/api/orders/${sampleOrder._id}/receipt`)
        .set('Cookie', [`access_token=${regularToken}`])
        .attach('receipt', Buffer.from('contenido del recibo'), 'receipt.pdf');

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });
});