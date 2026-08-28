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

  describe('getById', () => {
    it('debería retornar un status 200 y el producto correspondiente si existe', async () => {
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

      const fakeProduct = { _id: '123', title: 'Carlinga' };
      const originalGetById = ProductService.getById;
      ProductService.getById = async (id) => {
        if (id === '123') return fakeProduct;
        throw new Error('Not found');
      };

      try {
        await ProductController.getById(req, res, next);
      } finally {
        ProductService.getById = originalGetById;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeProduct);
    });
  });

  describe('getByTitle', () => {
    it('debería retornar un status 200 y el producto buscando por parámetro title', async () => {
      const req = { params: { title: 'Carlinga Optimist' } };
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

      const fakeProduct = { _id: '123', title: 'Carlinga Optimist' };
      const originalGetByTitle = ProductService.getByTitle;
      ProductService.getByTitle = async (title) => {
        if (title === 'Carlinga Optimist') return fakeProduct;
        throw new Error('Not found');
      };

      try {
        await ProductController.getByTitle(req, res, next);
      } finally {
        ProductService.getByTitle = originalGetByTitle;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeProduct);
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

  describe('update', () => {
    it('debería retornar un status 200 y el producto actualizado', async () => {
      const req = { params: { id: '123' }, body: { price: 75 } };
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

      const fakeUpdatedProduct = { _id: '123', price: 75 };
      const originalUpdate = ProductService.update;
      ProductService.update = async (id, data) => fakeUpdatedProduct;

      try {
        await ProductController.update(req, res, next);
      } finally {
        ProductService.update = originalUpdate;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeUpdatedProduct);
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

  describe('addThumbnail', () => {
    it('debería retornar un status 200 y el producto actualizado al agregar una imagen', async () => {
      const req = { 
        params: { id: '123' },
        file: { path: '/uploads/product.jpg', originalname: 'product.jpg' } 
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

      const fakeUpdatedProduct = { _id: '123', thumbnails: [req.file.path] };
      const originalAddThumbnail = ProductService.addThumbnail;
      ProductService.addThumbnail = async (id, file) => fakeUpdatedProduct;

      try {
        await ProductController.addThumbnail(req, res, next);
      } finally {
        ProductService.addThumbnail = originalAddThumbnail;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.include('Imagen agregada correctamente');
      expect(responseBody.payload).to.deep.equal(fakeUpdatedProduct);
    });
  });

});