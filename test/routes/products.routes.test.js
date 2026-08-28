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
  let testProduct;
  let mockProductData;

  beforeEach(async () => {
    // Limpiar colecciones
    await ProductModel.deleteMany({});
    await UserModel.deleteMany({});

    // Generar datos con MockService
    const [adminData, userData] = MockService.generateMockUsers(2);
    const [productData, newProductData] = MockService.generateMockProducts(2);
    mockProductData = newProductData;

    // Crear usuario administrador y generar cookie token
    adminData.role = USER_ROLES.ADMIN;
    adminUser = await UserModel.create(adminData);
    adminToken = generateToken({
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Crear usuario regular y generar cookie token
    userData.role = USER_ROLES.USER;
    regularUser = await UserModel.create(userData);
    regularToken = generateToken({
      id: regularUser._id,
      email: regularUser.email,
      role: regularUser.role
    });

    // Crear un producto base para las pruebas de lectura/actualización/eliminación
    testProduct = await ProductModel.create(productData);
  });

  describe('GET /api/products', () => {
    it('debería retornar la lista de productos de forma pública', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).to.equal(200);
      const productsList = response.body.payload || response.body;
      expect(productsList).to.be.an('array');
      expect(productsList.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería retornar un producto específico por su ID', async () => {
      const response = await request(app).get(`/api/products/${testProduct._id}`);

      expect(response.status).to.equal(200);
      const product = response.body.payload || response.body;
      expect(product).to.have.property('_id');
      expect(product.title).to.equal(testProduct.title);
    });

    it('debería retornar 404 y estructura de error al consultar un producto con ID sintácticamente válido pero inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${nonExistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
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

    it('debería denegar la creación si el usuario es regular (USER)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Cookie', [`access_token=${regularToken}`])
        .send(mockProductData);

      expect(response.status).to.be.oneOf([401, 403]);
    });

    it('debería retornar 400 y estructura de error si faltan campos obligatorios al crear un producto', async () => {
      const invalidProduct = {
        title: 'Solo Título Sin Precio Ni Stock'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Cookie', [`access_token=${adminToken}`])
        .send(invalidProduct);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('debería permitir a un ADMIN actualizar un producto', async () => {
      const updatedTitle = 'Producto Actualizado Test';
      const response = await request(app)
        .patch(`/api/products/${testProduct._id}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ title: updatedTitle });

      expect(response.status).to.equal(200);
      const updatedProduct = response.body.payload || response.body;
      expect(updatedProduct.title).to.equal(updatedTitle);
    });

    it('debería retornar 404 al intentar actualizar un producto con un ID inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/products/${nonExistentId}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ title: 'Cualquier cosa' });

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería permitir a un ADMIN eliminar un producto', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(200);

      // Verificamos que ya no exista
      const checkDeleted = await ProductModel.findById(testProduct._id);
      expect(checkDeleted).to.be.null;
    });

    it('debería retornar 404 al intentar eliminar un producto con un ID inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });
  });

});