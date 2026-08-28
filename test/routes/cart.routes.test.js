import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import {CartModel} from '../../src/models/cart.model.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';

describe('Cart Routes Integration Tests', () => {
  const BASE_URL = '/api/cart';
  let regularUser;
  let regularToken;
  let testProduct;

  beforeEach(async () => {
    // 1. Limpiar colecciones
    await CartModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    // 2. Generar usuario y producto con MockService
    const [userData] = MockService.generateMockUsers(1);
    const [productData] = MockService.generateMockProducts(1);

    userData.role = USER_ROLES.USER;
    regularUser = await UserModel.create(userData);
    regularToken = generateToken({ id: regularUser._id, email: regularUser.email, role: regularUser.role });

    testProduct = await ProductModel.create(productData);
  });

  describe(`GET ${BASE_URL}`, () => {
    it('debería denegar el acceso si no hay token de autenticación', async () => {
      const response = await request(app).get(BASE_URL);
      expect(response.status).to.be.oneOf([401, 403]);
    });

    it('debería permitir obtener el carrito del usuario autenticado', async () => {
      const response = await request(app)
        .get(BASE_URL)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.equal(200);
    });
  });

  describe(`POST ${BASE_URL}/products`, () => {
    it('debería permitir agregar un producto al carrito', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/products`)
        .set('Cookie', [`access_token=${regularToken}`])
        .send({
          productId: testProduct._id,
          quantity: 2
        });

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('debería retornar 400 y estructura de error si se intenta agregar un producto con datos inválidos o faltantes', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/products`)
        .set('Cookie', [`access_token=${regularToken}`])
        .send({
          // Falta productId o quantity inválida
          quantity: -1
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });

    it('debería retornar 404 si se intenta agregar un producto con un ID inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`${BASE_URL}/products`)
        .set('Cookie', [`access_token=${regularToken}`])
        .send({
          productId: nonExistentId,
          quantity: 1
        });

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });
  });

  describe(`DELETE ${BASE_URL}`, () => {
    it('debería permitir vaciar el carrito del usuario', async () => {
      // Primero agregamos un producto para asegurarnos de que hay algo que limpiar
      await request(app)
        .post(`${BASE_URL}/products`)
        .set('Cookie', [`access_token=${regularToken}`])
        .send({
          productId: testProduct._id,
          quantity: 1
        });

      // Luego vaciamos el carrito
      const response = await request(app)
        .delete(BASE_URL)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.equal(200);
    });
  });

});