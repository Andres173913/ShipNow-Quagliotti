import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import OrderModel from '../../src/models/order.model.js';
import UserService from '../../src/services/users.service.js';
import { ORDER_STATUS } from '../../src/constants/order.js';

describe('Functional Tests - File Uploads & Middlewares', () => {
  let authToken;
  let testUserId;
  let testProductId;
  let testOrderId;

  beforeEach(async () => {
    // 1. Crear usuario de prueba para autenticación
    const mockUser = {
      first_name: 'Test',
      last_name: 'Middleware',
      email: `test.middleware.${Date.now()}@example.com`,
      password: 'Password123',
      role: 'admin'
    };

    const user = await UserService.create(mockUser);
    testUserId = user._id.toString();

    // 2. Crear producto de prueba
    const product = await ProductModel.create({
      title: 'Producto Test Middleware',
      description: 'Descripción de prueba para producto',
      category: 'General',
      price: 150,
      stock: 20,
      code: `PROD-MW-${Date.now()}`
    });
    testProductId = product._id.toString();

    // 3. Crear orden de prueba
    const order = await OrderModel.create({
      client: testUserId,
      total_price: 150,
      delivery_address: 'Av. Corrientes 1234, Rosario',
      status: ORDER_STATUS.PENDING
    });
    testOrderId = order._id.toString();

    // 4. Iniciar sesión para obtener cookie
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: mockUser.email, password: 'Password123' });

    authToken = loginRes.headers['set-cookie'];
  });

  afterEach(async () => {
    // Limpieza de datos de prueba
    if (testUserId) await UserModel.findByIdAndDelete(testUserId);
    if (testProductId) await ProductModel.findByIdAndDelete(testProductId);
    if (testOrderId) await OrderModel.findByIdAndDelete(testOrderId);
  });

  describe('POST /api/users/:id/documents (Subida de documentos de usuario)', () => {
    it('Debería subir y organizar un documento correctamente (200/201)', async () => {
      const res = await request(app)
        .post(`/api/users/${testUserId}/documents`)
        .set('Cookie', authToken)
        .field('documentType', 'DNI')
        .attach('document', Buffer.from('fake image content'), 'dni.jpg');

      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.be.an('object');
    });

    it('Debería retornar error 400 si falta adjuntar el archivo', async () => {
      const res = await request(app)
        .post(`/api/users/${testUserId}/documents`)
        .set('Cookie', authToken)
        .field('documentType', 'DNI');

      expect(res.status).to.equal(400);
    });

    it('Debería retornar error 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/users/${fakeId}/documents`)
        .set('Cookie', authToken)
        .field('documentType', 'DNI')
        .attach('document', Buffer.from('fake image content'), 'dni.jpg');

      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/products/:id/image (Subida de thumbnail de producto)', () => {
    it('Debería subir la miniatura del producto correctamente', async () => {
      const res = await request(app)
        .post(`/api/products/${testProductId}/image`)
        .set('Cookie', authToken)
        .attach('thumbnail', Buffer.from('fake thumbnail content'), 'thumb.png');

      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.be.an('object');
    });
  });

  describe('POST /api/orders/:id/receipt (Subida de comprobante de orden)', () => {
    it('Debería subir el comprobante de la orden correctamente', async () => {
      const res = await request(app)
        .post(`/api/orders/${testOrderId}/receipt`)
        .set('Cookie', authToken)
        .attach('receipt', Buffer.from('fake pdf receipt content'), 'recibo.pdf');

      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.be.an('object');
    });

    it('Debería retornar error 404 si la orden no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/orders/${fakeId}/receipt`)
        .set('Cookie', authToken)
        .attach('receipt', Buffer.from('fake pdf receipt content'), 'recibo.pdf');

      expect(res.status).to.equal(404);
    });
  });
});