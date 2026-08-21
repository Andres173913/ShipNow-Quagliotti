import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import mocksRouter from '../../../src/mocks/routes/mocks.routes.js';
import UserModel from '../../../src/models/user.model.js';
import ProductModel from '../../../src/models/product.model.js';
import OrderModel from '../../../src/models/order.model.js';

const app = express();
app.use(express.json());
app.use('/api/mocks', mocksRouter);

// Middleware básico de manejo de errores para que Express no devuelva HTML plano en los tests si salta un AppError
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message
  });
});

describe('Mocks Routes Integration Tests', () => {

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await OrderModel.deleteMany({});
  });

  describe('GET /api/mocks/mocking-users', () => {
    it('debería retornar un array de usuarios simulados cuando se provee un count válido', async () => {
      const response = await request(app).get('/api/mocks/mocking-users?count=5');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array').that.has.lengthOf(5);
    });
  });

  describe('GET /api/mocks/mocking-products', () => {
    it('debería retornar un array de productos simulados cuando se provee un count válido', async () => {
      const response = await request(app).get('/api/mocks/mocking-products?count=3');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array').that.has.lengthOf(3);
    });
  });

  describe('POST /api/mocks/generate-data', () => {
    it('debería generar e insertar la cantidad de registros especificados de usuarios, productos y órdenes', async () => {
      const bodyPayload = {
        usersCount: 3,
        productsCount: 4,
        ordersCount: 2
      };

      const response = await request(app)
        .post('/api/mocks/generate-data')
        .send(bodyPayload);

      expect(response.status).to.equal(201); // El controlador responde con 201 en el éxito
      expect(response.body.status).to.equal('success');

      // Verificamos que realmente se hayan guardado en la base de datos de tests
      const userCount = await UserModel.countDocuments();
      const productCount = await ProductModel.countDocuments();
      const orderCount = await OrderModel.countDocuments();

      expect(userCount).to.equal(3);
      expect(productCount).to.equal(4);
      expect(orderCount).to.equal(2);
    });
  });

});