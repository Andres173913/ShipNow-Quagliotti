import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import ProductModel from '../../src/models/product.model.js';
import UserModel from '../../src/models/user.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';

describe('Products Routes Integration Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;
  let sampleProduct;
  let mockProductData;

  beforeEach(async () => {
    // Limpiar colecciones
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

    // Generar datos de producto mock
    const products = MockService.generateMockProducts(2);
    mockProductData = products[0];
    sampleProduct = await ProductModel.create(products[1]);
  });

  describe('GET /api/products', () => {
    it('debería listar todos los productos exitosamente', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).to.equal(200);
      const productsList = response.body.payload || response.body;
      expect(productsList).to.be.an('array');
      expect(productsList.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería retornar un producto por su ID', async () => {
      const response = await request(app)
        .get(`/api/products/${sampleProduct._id}`);

      expect(response.status).to.equal(200);
      const foundProduct = response.body.payload || response.body;
      expect(foundProduct.title).to.equal(sampleProduct.title);
    });

    it('debería retornar 404 para un ID de producto válido pero inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${nonExistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
    });
  });

  describe('POST /api/products', () => {
    it('debería permitir a un ADMIN crear un producto exitosamente', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(mockProductData);

      expect(response.status).to.be.oneOf([200, 201]);
      const createdProduct = response.body.payload || response.body;
      expect(createdProduct).to.have.property('_id');
      expect(createdProduct.title).to.equal(mockProductData.title);
    });

    it('debería denegar la creación de un producto si el usuario no es ADMIN', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Cookie', [`access_token=${regularToken}`])
        .send(mockProductData);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('debería permitir a un ADMIN actualizar parcialmente un producto', async () => {
      const response = await request(app)
        .patch(`/api/products/${sampleProduct._id}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ title: 'Patched Product Title' });

      expect(response.status).to.equal(200);
      const updatedProduct = response.body.payload || response.body;
      expect(updatedProduct.title).to.equal('Patched Product Title');
    });

    it('debería denegar la actualización si el usuario no es ADMIN', async () => {
      const response = await request(app)
        .patch(`/api/products/${sampleProduct._id}`)
        .set('Cookie', [`access_token=${regularToken}`])
        .send({ title: 'Unauthorized Patch' });

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería permitir a un ADMIN eliminar un producto', async () => {
      const response = await request(app)
        .delete(`/api/products/${sampleProduct._id}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('debería denegar la eliminación si el usuario no es ADMIN', async () => {
      const response = await request(app)
        .delete(`/api/products/${sampleProduct._id}`)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('POST /api/products/:id/image', () => {
    it('debería permitir a un ADMIN subir la imagen de un producto', async () => {
      const response = await request(app)
        .post(`/api/products/${sampleProduct._id}/image`)
        .set('Cookie', [`access_token=${adminToken}`])
        .attach('thumbnail', Buffer.from('contenido binario de imagen'), 'product.jpg');

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('debería denegar la subida de imagen si el usuario no es ADMIN', async () => {
      const response = await request(app)
        .post(`/api/products/${sampleProduct._id}/image`)
        .set('Cookie', [`access_token=${regularToken}`])
        .attach('thumbnail', Buffer.from('contenido binario de imagen'), 'product.jpg');

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });
});