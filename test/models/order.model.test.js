import { expect } from 'chai';
import mongoose from 'mongoose';
import OrderModel from '../../src/models/order.model.js';

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
      expect(err.errors.client).to.exist;
      expect(err.errors.total_price).to.exist;
      expect(err.errors.delivery_address).to.exist;
    });

    it('debería asignar el estado por defecto ("pending") si no se especifica', async () => {
      const mockOrderData = {
        client: new mongoose.Types.ObjectId(),
        total_price: 1500,
        delivery_address: 'Av. Libertador 1234'
      };

      const order = new OrderModel(mockOrderData);
      const savedOrder = await order.save();

      expect(savedOrder.status.toLowerCase()).to.equal('pending');
      expect(savedOrder.courier).to.be.undefined;
      expect(savedOrder.createdAt).to.exist;
      expect(savedOrder.updatedAt).to.exist;
    });
  });

  describe('Validaciones de Rango y Valores Permitidos', () => {
    it('debería fallar si total_price es menor a 0 (min: 0)', async () => {
      const mockOrderData = {
        client: new mongoose.Types.ObjectId(),
        total_price: -100,
        delivery_address: 'Calle Falsa 123'
      };

      const order = new OrderModel(mockOrderData);

      let err;
      try {
        await order.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors.total_price).to.exist;
    });

    it('debería permitir guardar objetos de recibos estructurados en el array receipts', async () => {
      const mockOrderData = {
        client: new mongoose.Types.ObjectId(),
        total_price: 2500,
        delivery_address: 'San Martín 555',
        receipts: [{
          originalName: 'comprobante.pdf',
          generatedName: 'gen-comprobante.pdf',
          path: '/uploads/gen-comprobante.pdf',
          mimetype: 'application/pdf',
          size: 1536,
          documentType: 'receipt'
        }]
      };

      const savedOrder = await OrderModel.create(mockOrderData);

      expect(savedOrder.receipts).to.be.an('array');
      expect(savedOrder.receipts.length).to.equal(1);
      expect(savedOrder.receipts[0].originalName).to.equal('comprobante.pdf');
    });
  });

});