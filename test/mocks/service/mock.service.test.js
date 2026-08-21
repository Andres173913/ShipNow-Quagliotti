import { expect } from 'chai';
import mongoose from 'mongoose';
import MockService from '../../../src/mocks/services/mock.service.js';
import UserModel from '../../../src/models/user.model.js';
import ProductModel from '../../../src/models/product.model.js';
import OrderModel from '../../../src/models/order.model.js';

describe('Mock Service Tests', () => {

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await OrderModel.deleteMany({});
  });

  describe('Generación en Memoria', () => {
    it('debería generar la cantidad correcta de usuarios mock', () => {
      const users = MockService.generateMockUsers(5);
      expect(users).to.be.an('array').that.has.lengthOf(5);
      expect(users[0]).to.have.property('first_name');
      expect(users[0]).to.have.property('email');
      expect(users[0]).to.have.property('role');
    });

    it('debería generar la cantidad correcta de productos mock con sus miniaturas', () => {
      const products = MockService.generateMockProducts(3);
      expect(products).to.be.an('array').that.has.lengthOf(3);
      expect(products[0]).to.have.property('title');
      expect(products[0]).to.have.property('price');
      expect(products[0].thumbnails).to.be.an('array');
    });

    it('debería generar órdenes mock correctamente utilizando los IDs provistos', () => {
      const dummyUserIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const dummyProductIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const dummyCourierIds = [new mongoose.Types.ObjectId()];

      const orders = MockService.generateMockOrders(2, dummyUserIds, dummyProductIds, dummyCourierIds);

      expect(orders).to.be.an('array').that.has.lengthOf(2);
      expect(orders[0]).to.have.property('userId');
      expect(orders[0]).to.have.property('products').that.is.an('array');
      expect(orders[0]).to.have.property('total').that.is.a('number');
      expect(orders[0]).to.have.property('status');
    });
  });

  describe('Persistencia en Base de Datos', () => {
    it('debería guardar usuarios mock en la base de datos exitosamente', async () => {
      const mockUsers = MockService.generateMockUsers(2);
      const savedUsers = await MockService.saveMockUsers(mockUsers);

      expect(savedUsers).to.be.an('array').that.has.lengthOf(2);
      
      const count = await UserModel.countDocuments();
      expect(count).to.equal(2);
    });

    it('debería guardar productos mock en la base de datos exitosamente', async () => {
      const mockProducts = MockService.generateMockProducts(2);
      const savedProducts = await MockService.saveMockProducts(mockProducts);

      expect(savedProducts).to.be.an('array').that.has.lengthOf(2);
      
      const count = await ProductModel.countDocuments();
      expect(count).to.equal(2);
    });
  });

});