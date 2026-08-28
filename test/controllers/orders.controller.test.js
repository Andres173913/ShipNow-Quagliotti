import { expect } from 'chai';
import OrderController from '../../src/controllers/orders.controller.js';
import OrderService from '../../src/services/orders.service.js';

describe('Order Controller Unit Tests', () => {

  describe('getAvailable', () => {
    it('debería retornar un status 200 y la lista de órdenes disponibles para couriers', async () => {
      const req = {};
      let responseStatus = null;
      let responseBody = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };
      const next = (err) => { throw err; };

      const fakeOrders = [{ _id: 'ord-1', status: 'pending' }];
      const originalGetAvailable = OrderService.getAvailableOrdersForCourier;
      OrderService.getAvailableOrdersForCourier = async () => fakeOrders;

      try {
        await OrderController.getAvailable(req, res, next);
      } finally {
        OrderService.getAvailableOrdersForCourier = originalGetAvailable;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeOrders);
    });

    it('debería delegar el error a next si OrderService.getAvailableOrdersForCourier falla', async () => {
      const req = {};
      const res = {};
      let errorCaptured = null;
      const next = (err) => { errorCaptured = err; };

      const originalGetAvailable = OrderService.getAvailableOrdersForCourier;
      OrderService.getAvailableOrdersForCourier = async () => { throw new Error('DB Error'); };

      try {
        await OrderController.getAvailable(req, res, next);
      } finally {
        OrderService.getAvailableOrdersForCourier = originalGetAvailable;
      }

      expect(errorCaptured).to.exist;
      expect(errorCaptured.message).to.equal('DB Error');
    });
  });

  describe('accept', () => {
    it('debería asignar el pedido al courier autenticado y retornar status 200', async () => {
      const req = {
        params: { id: 'ord-123' },
        user: { id: 'courier-uuid-456' } // Simulando el usuario autenticado por JWT
      };

      let responseStatus = null;
      let responseBody = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };
      const next = (err) => { throw err; };

      const updatedOrder = { _id: 'ord-123', courier: 'courier-uuid-456', status: 'accepted' };
      const originalAccept = OrderService.acceptOrder;
      OrderService.acceptOrder = async (orderId, courierId) => {
        expect(orderId).to.equal('ord-123');
        expect(courierId).to.equal('courier-uuid-456');
        return updatedOrder;
      };

      try {
        await OrderController.accept(req, res, next);
      } finally {
        OrderService.acceptOrder = originalAccept;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.include('Pedido asignado con éxito');
      expect(responseBody.order).to.deep.equal(updatedOrder);
    });
  });

  describe('deliver', () => {
    it('debería marcar el pedido como entregado y retornar status 200', async () => {
      const req = {
        params: { id: 'ord-123' },
        user: { id: 'courier-uuid-456' }
      };

      let responseStatus = null;
      let responseBody = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };
      const next = (err) => { throw err; };

      const deliveredOrder = { _id: 'ord-123', status: 'delivered' };
      const originalDeliver = OrderService.deliverOrder;
      OrderService.deliverOrder = async (orderId, courierId) => {
        expect(orderId).to.equal('ord-123');
        expect(courierId).to.equal('courier-uuid-456');
        return deliveredOrder;
      };

      try {
        await OrderController.deliver(req, res, next);
      } finally {
        OrderService.deliverOrder = originalDeliver;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.include('Pedido marcado como entregado');
      expect(responseBody.order).to.deep.equal(deliveredOrder);
    });
  });

  describe('uploadReceipt', () => {
    it('debería subir y asociar el comprobante a la orden y retornar status 200', async () => {
      const req = {
        params: { id: 'ord-123' },
        file: { originalname: 'receipt.pdf', filename: 'gen-receipt.pdf', path: '/uploads/gen-receipt.pdf', mimetype: 'application/pdf', size: 1024 }
      };

      let responseStatus = null;
      let responseBody = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };
      const next = (err) => { throw err; };

      const updatedOrder = { _id: 'ord-123', receipts: [req.file] };
      const originalUploadReceipt = OrderService.uploadReceipt;
      OrderService.uploadReceipt = async (orderId, file) => {
        expect(orderId).to.equal('ord-123');
        expect(file).to.deep.equal(req.file);
        return updatedOrder;
      };

      try {
        await OrderController.uploadReceipt(req, res, next);
      } finally {
        OrderService.uploadReceipt = originalUploadReceipt;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.include('Comprobante subido y asociado con éxito');
      expect(responseBody.order).to.deep.equal(updatedOrder);
    });
  });

});