import { expect } from 'chai';
import OrderService from '../../src/services/orders.service.js';
import MockService from '../../src/mocks/services/mock.service.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import OrderModel from '../../src/models/order.model.js';
import { ORDER_STATUS } from '../../src/constants/order.js';
import { AppError } from '../../src/errors/index.js';

describe('OrderService Integration Tests', () => {
  let testUser;
  let testCourier;
  let testProduct;
  let testOrder;

  beforeEach(async () => {
    // 1. Limpiar colecciones relacionadas antes de cada test por seguridad
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    // 2. Crear un usuario cliente y un courier usando MockService
    const [clientData, courierData] = MockService.generateMockUsers(2);
    clientData.role = 'user';
    courierData.role = 'courier';

    testUser = await UserModel.create(clientData);
    testCourier = await UserModel.create(courierData);

    // 3. Crear un producto usando MockService
    const [productData] = MockService.generateMockProducts(1);
    testProduct = await ProductModel.create(productData);

    // 4. Crear una orden inicial lista para ser gestionada (estado READY, sin courier asignado)
    testOrder = await OrderModel.create({
      userId: testUser._id,
      products: [{ productId: testProduct._id, quantity: 2 }],
      total: testProduct.price * 2,
      status: ORDER_STATUS.READY,
      courierId: null
    });
  });

  describe('getAvailableOrdersForCourier()', () => {
    it('debería retornar los pedidos disponibles para repartidores', async () => {
      const availableOrders = await OrderService.getAvailableOrdersForCourier();

      expect(availableOrders).to.be.an('array');
      expect(availableOrders.length).to.be.greaterThan(0);
      expect(availableOrders[0]._id.toString()).to.equal(testOrder._id.toString());
    });
  });

  describe('acceptOrder()', () => {
    it('debería permitir a un courier aceptar un pedido disponible y cambiar su estado a IN_TRANSIT', async () => {
      const acceptedOrder = await OrderService.acceptOrder(testOrder._id, testCourier._id);

      expect(acceptedOrder.status).to.equal(ORDER_STATUS.IN_TRANSIT);
      expect(acceptedOrder.courierId.toString()).to.equal(testCourier._id.toString());
    });

    it('debería fallar si el pedido ya no está disponible', async () => {
      // Lo acepta primero un courier
      await OrderService.acceptOrder(testOrder._id, testCourier._id);

      // Intentar aceptarlo nuevamente debería fallar
      try {
        await OrderService.acceptOrder(testOrder._id, testCourier._id);
        expect.fail('Debería haber fallado porque el pedido ya está tomado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('Este pedido ya no está disponible');
      }
    });
  });

  describe('deliverOrder()', () => {
    it('debería permitir al courier asignado marcar el pedido como DELIVERED', async () => {
      // Primero se acepta
      await OrderService.acceptOrder(testOrder._id, testCourier._id);

      // Luego se entrega
      const deliveredOrder = await OrderService.deliverOrder(testOrder._id, testCourier._id);

      expect(deliveredOrder.status).to.equal(ORDER_STATUS.DELIVERED);
    });

    it('debería fallar si intenta entregar un pedido un courier que no fue el asignado', async () => {
      await OrderService.acceptOrder(testOrder._id, testCourier._id);

      // Creamos otro courier falso
      const [anotherCourierData] = MockService.generateMockUsers(1);
      anotherCourierData.role = 'courier';
      const anotherCourier = await UserModel.create(anotherCourierData);

      try {
        await OrderService.deliverOrder(testOrder._id, anotherCourier._id);
        expect.fail('Debería fallar por acceso denegado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
      }
    });
  });

});