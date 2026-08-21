import { expect } from 'chai';
import mongoose from 'mongoose';
import OrderModel from '../../src/models/order.model.js';
import { ORDER_STATUS } from '../../src/constants/order.js';
import MockService from '../../src/mocks/services/mock.service.js';

describe('Order Model Validation Tests', () => {

  beforeEach(async () => {
    await OrderModel.deleteMany({});
  });

  describe('Esquema y Campos Requeridos', () => {
    it('debería fallar si se intenta crear una orden sin los campos obligatorios', async () => {
      const orderWithoutRequiredField = new OrderModel({});

      let err;
      try {
        await orderWithoutRequiredField.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors.userId).to.exist;
      expect(err.errors.total).to.exist;
    });

    it('debería asignar el estado por defecto (PENDING) y courierId en null si no se especifican', async () => {
      const mockOrderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [
          {
            productId: new mongoose.Types.ObjectId(),
            quantity: 2
          }
        ],
        total: 1500
      };

      const order = new OrderModel(mockOrderData);
      const savedOrder = await order.save();

      expect(savedOrder.status).to.equal(ORDER_STATUS.PENDING);
      expect(savedOrder.courierId).to.be.null;
      expect(savedOrder.createdAt).to.exist;
      expect(savedOrder.updatedAt).to.exist;
    });
  });

  describe('Validaciones de Estructura de Productos', () => {
    it('debería fallar si un producto dentro de la orden no tiene productId o quantity', async () => {
      const invalidOrderData = {
        userId: new mongoose.Types.ObjectId(),
        products: [
          {
            // Falta productId y quantity
          }
        ],
        total: 500
      };

      const order = new OrderModel(invalidOrderData);

      let err;
      try {
        await order.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors['products.0.productId']).to.exist;
      expect(err.errors['products.0.quantity']).to.exist;
    });
  });

});
