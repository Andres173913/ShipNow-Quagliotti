import { expect } from 'chai';
import ProductController from '../../src/controllers/products.controller.js';
import ProductService from '../../src/services/products.service.js';

describe('Product Controller Unit Tests', () => {

  describe('getAll', () => {
    it('debería retornar un status 200 y la lista de productos', async () => {
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

      const fakeProducts = [{ _id: '1', title: 'Carlinga Optimist', price: 100 }];
      const originalGetAll = ProductService.getAll;
      ProductService.getAll = async () => fakeProducts;

      try {
        await ProductController.getAll(req, res, next);
      } finally {
        ProductService.getAll = originalGetAll;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeProducts);
    });

    it('debería delegar el error a next si ProductService.getAll falla', async () => {
      const req = {};
      const res = {};
      let errorCaptured = null;
      const next = (err) => { errorCaptured = err; };

      const originalGetAll = ProductService.getAll;
      ProductService.getAll = async () => { throw new Error('DB Error'); };

      try {
        await ProductController.getAll(req, res, next);
      } finally {
        ProductService.getAll = originalGetAll;
      }

      expect(errorCaptured).to.exist;
      expect(errorCaptured.message).to.equal('DB Error');
    });
  });

  describe('create', () => {
    it('debería crear un producto, retornar status 201 y el payload con el nuevo producto', async () => {
      const newProductData = {
        title: 'Cabo náutico',
        description: 'Cabo de alta resistencia',
        price: 50,
        stock: 20,
        category: 'Accesorios',
        code: 'CABO-01'
      };

      const req = { body: newProductData };
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

      const createdProduct = { _id: '123', ...newProductData };
      const originalCreate = ProductService.create;
      ProductService.create = async () => createdProduct;

      try {
        await ProductController.create(req, res, next);
      } finally {
        ProductService.create = originalCreate;
      }

      expect(responseStatus).to.equal(201);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(createdProduct);
    });
  });

  describe('delete', () => {
    it('debería eliminar un producto y retornar status 200 con mensaje de éxito', async () => {
      const req = { params: { id: '123' } };
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

      const originalDelete = ProductService.delete;
      ProductService.delete = async () => ({ deletedCount: 1 });

      try {
        await ProductController.delete(req, res, next);
      } finally {
        ProductService.delete = originalDelete;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.include('eliminado con éxito');
    });
  });

});