import { expect } from 'chai';
import OrderRepository from '../../src/repositories/orders.repository.js';
import OrderModel from '../../src/models/order.model.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { ORDER_STATUS } from '../../src/constants/order.js';

describe('OrderRepository Integration Tests', () => {
  let testUser;
  let testProduct;

  beforeEach(async () => {
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    const [userData] = MockService.generateMockUsers(1);
    const [productData] = MockService.generateMockProducts(1);

    testUser = await UserModel.create(userData);
    testProduct = await ProductModel.create(productData);
  });

  describe('findAll() y findById()', () => {
    it('debería retornar todas las órdenes y buscar una por su ID', async () => {
      const newOrder = await OrderModel.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 1 }],
        total: 500,
        status: ORDER_STATUS.READY,
        courierId: null
      });

      const orders = await OrderRepository.findAll();
      expect(orders).to.be.an('array').that.is.not.empty;
      expect(orders.length).to.equal(1);

      const foundOrder = await OrderRepository.findById(newOrder._id);
      expect(foundOrder).to.not.be.null;
      expect(foundOrder._id.toString()).to.equal(newOrder._id.toString());
    });
  });

  describe('findAvailableForCouriers()', () => {
    it('debería retornar únicamente las órdenes con estado READY y sin courier asignado', async () => {
      // Orden disponible (READY y courierId null)
      await OrderModel.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 1 }],
        total: 500,
        status: ORDER_STATUS.READY,
        courierId: null
      });

      // Orden no disponible (estado diferente)
      await OrderModel.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 1 }],
        total: 500,
        status: ORDER_STATUS.PENDING,
        courierId: null
      });

      // Orden no disponible (ya tiene courier)
      await OrderModel.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 1 }],
        total: 500,
        status: ORDER_STATUS.READY,
        courierId: testUser._id
      });

      const availableOrders = await OrderRepository.findAvailableForCouriers();
      expect(availableOrders).to.be.an('array');
      expect(availableOrders.length).to.equal(1);
      expect(availableOrders[0].status).to.equal(ORDER_STATUS.READY);
      expect(availableOrders[0].courierId).to.be.null;
    });
  });

  describe('update()', () => {
    it('debería actualizar los datos de una orden', async () => {
      const newOrder = await OrderModel.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 1 }],
        total: 500,
        status: ORDER_STATUS.READY,
        courierId: null
      });

      const updatedOrder = await OrderRepository.update(newOrder._id, {
        status: ORDER_STATUS.IN_TRANSIT,
        courierId: testUser._id
      });

      expect(updatedOrder.status).to.equal(ORDER_STATUS.IN_TRANSIT);
      expect(updatedOrder.courierId.toString()).to.equal(testUser._id.toString());
    });
  });

});