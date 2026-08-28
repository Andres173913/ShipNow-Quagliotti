import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import OrderModel from '../../src/models/order.model.js';
import UserService from '../../src/services/users.service.js';
import { ORDER_STATUS } from '../../src/constants/order.js';

describe('Functional Tests - Multer Uploads & File Management', () => {
  let authCookie;
  let testUserId;
  let testProductId;
  let testOrderId;

  beforeEach(async () => {
    // 1. Crear un usuario de prueba (Admin/Courier) para autenticación
    const mockUser = {
      first_name: 'Test',
      last_name: 'Upload',
      email: `test.upload.${Date.now()}@example.com`,
      password: 'Password123',
      role: 'admin'
    };

    const user = await UserService.create(mockUser);
    testUserId = user._id.toString();

    // 2. Crear un producto de prueba
    const product = await ProductModel.create({
      title: 'Producto de Prueba Multer',
      description: 'Descripción de prueba',
      category: 'Embalaje',
      price: 100,
      stock: 10,
      code: `PROD-${Date.now()}`
    });
    testProductId = product._id.toString();

    // 3. Crear una orden de prueba asociada al usuario
    const order = await OrderModel.create({
      client: testUserId,
      total_price: 100,
      delivery_address: 'Av. Pellegrini 1234, Rosario',
      status: ORDER_STATUS.PENDING
    });
    testOrderId = order._id.toString();

    // 4. Iniciar sesión para obtener la cookie o token de autenticación de forma robusta
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: mockUser.email, password: 'Password123' });

    if (loginRes.headers['set-cookie']) {
      authCookie = loginRes.headers['set-cookie'];
    } else {
      const token = loginRes.body.token || loginRes.body.access_token || loginRes.body.payload;
      if (token) {
        authCookie = [`access_token=${token}`];
      }
    }
  });

  afterEach(async () => {
    // Limpieza de la base de datos de prueba
    if (testUserId) await UserModel.findByIdAndDelete(testUserId);
    if (testProductId) await ProductModel.findByIdAndDelete(testProductId);
    if (testOrderId) await OrderModel.findByIdAndDelete(testOrderId);
  });

  describe('POST /api/users/:id/documents', () => {
    it('Debería subir un documento de usuario correctamente', async () => {
      const req = request(app).post(`/api/users/${testUserId}/documents`);
      if (authCookie) req.set('Cookie', authCookie);

      const res = await req
        .field('documentType', 'DNI')
        .attach('document', Buffer.from('fake image binary content'), 'dni_test.jpg');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
    });

    it('Debería retornar error 400 si falta adjuntar el archivo', async () => {
      const req = request(app).post(`/api/users/${testUserId}/documents`);
      if (authCookie) req.set('Cookie', authCookie);

      const res = await req.field('documentType', 'DNI');

      expect(res.status).to.equal(400);
    });

    it('Debería retornar error 404 si el usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = request(app).post(`/api/users/${fakeId}/documents`);
      if (authCookie) req.set('Cookie', authCookie);

      const res = await req
        .field('documentType', 'DNI')
        .attach('document', Buffer.from('fake image binary content'), 'dni_test.jpg');

      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/products/:id/image', () => {
    it('Debería subir la miniatura (thumbnail) de un producto correctamente', async () => {
      const req = request(app).post(`/api/products/${testProductId}/image`);
      if (authCookie) req.set('Cookie', authCookie);

      const res = await req.attach('thumbnail', Buffer.from('fake thumbnail content'), 'thumb.jpg');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
    });
  });

  describe('POST /api/orders/:id/receipt', () => {
    it('Debería subir el comprobante de una orden correctamente', async () => {
      const req = request(app).post(`/api/orders/${testOrderId}/receipt`);
      if (authCookie) req.set('Cookie', authCookie);

      const res = await req.attach('receipt', Buffer.from('fake receipt pdf content'), 'comprobante.pdf');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
    });

    it('Debería retornar error 404 si la orden no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = request(app).post(`/api/orders/${fakeId}/receipt`);
      if (authCookie) req.set('Cookie', authCookie);

      const res = await req.attach('receipt', Buffer.from('fake receipt pdf content'), 'comprobante.pdf');

      expect(res.status).to.equal(404);
    });
  });
});