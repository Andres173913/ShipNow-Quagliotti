import { expect } from 'chai';
import mongoose from 'mongoose';
import ProductService from '../../src/services/products.service.js';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { AppError } from '../../src/errors/index.js';

describe('ProductService Integration Tests', () => {
  let mockProduct;

  beforeEach(async () => {
    // Limpiar la colección de productos para mantener aislamiento entre pruebas
    await ProductModel.deleteMany({});
    
    // Generar un producto único usando MockService para cada prueba
    const [generatedProduct] = MockService.generateMockProducts(1);
    mockProduct = generatedProduct;
  });

  describe('create() y getById()', () => {
    it('debería crear un producto nuevo y poder buscarlo por su ID', async () => {
      const createdProduct = await ProductService.create(mockProduct);

      expect(createdProduct).to.have.property('_id');
      expect(createdProduct.title).to.equal(mockProduct.title);

      const foundProduct = await ProductService.getById(createdProduct._id);
      expect(foundProduct).to.not.be.null;
      expect(foundProduct.title).to.equal(mockProduct.title);
    });

    it('debería lanzar un error si se intenta registrar un título duplicado', async () => {
      // Creamos el producto por primera vez
      await ProductService.create(mockProduct);

      // Intentamos crearlo de nuevo con el mismo título
      try {
        await ProductService.create(mockProduct);
        expect.fail('Debería haber lanzado error por título duplicado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('Ya existe un producto registrado con ese título');
      }
    });

    it('debería lanzar un error si faltan campos obligatorios en el create', async () => {
      try {
        await ProductService.create({ title: 'Solo Título' });
        expect.fail('Debería haber lanzado error por campos obligatorios faltantes');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('Todos los campos obligatorios');
      }
    });
  });

  describe('getByTitle()', () => {
    it('debería retornar un producto buscando por título existente', async () => {
      await ProductService.create(mockProduct);

      const foundProduct = await ProductService.getByTitle(mockProduct.title);
      expect(foundProduct).to.not.be.null;
      expect(foundProduct.title).to.equal(mockProduct.title);
    });

    it('debería lanzar un error si el título no existe', async () => {
      try {
        await ProductService.getByTitle('Título Inexistente 999');
        expect.fail('Debería haber lanzado error de producto no encontrado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
    });
  });

  describe('getAll()', () => {
    it('debería retornar una lista con los productos existentes', async () => {
      await ProductService.create(mockProduct);

      const products = await ProductService.getAll();

      expect(products).to.be.an('array');
      expect(products.length).to.be.greaterThan(0);
    });
  });

  describe('update()', () => {
    it('debería actualizar un producto correctamente', async () => {
      const createdProduct = await ProductService.create(mockProduct);
      const newTitle = 'Título Actualizado Test';

      const updatedProduct = await ProductService.update(createdProduct._id, { title: newTitle });

      expect(updatedProduct.title).to.equal(newTitle);
    });

    it('debería fallar al actualizar si el ID no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      try {
        await ProductService.update(fakeId, { title: 'Nuevo Título' });
        expect.fail('Debería haber fallado por producto no encontrado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
    });

    it('debería lanzar error al intentar actualizar con un título duplicado de otro producto', async () => {
      const [product1, product2] = MockService.generateMockProducts(2);
      const created1 = await ProductService.create(product1);
      const created2 = await ProductService.create(product2);

      try {
        await ProductService.update(created2._id, { title: created1.title });
        expect.fail('Debería haber lanzado error por título duplicado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('Ya existe otro producto registrado con ese título');
      }
    });
  });

  describe('delete()', () => {
    it('debería eliminar un producto existente', async () => {
      const createdProduct = await ProductService.create(mockProduct);

      const deleted = await ProductService.delete(createdProduct._id);
      expect(deleted).to.not.be.null;

      try {
        await ProductService.getById(createdProduct._id);
        expect.fail('El producto debería haber sido eliminado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
    });

    it('debería lanzar error al intentar eliminar un producto con ID inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      try {
        await ProductService.delete(nonExistentId);
        expect.fail('Debería haber lanzado error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
    });
  });

  describe('addThumbnail()', () => {
    it('debería agregar una imagen al array de thumbnails exitosamente', async () => {
      const created = await ProductService.create(mockProduct);
      const mockFile = {
        path: '/uploads/product-image.jpg'
      };

      const updated = await ProductService.addThumbnail(created._id, mockFile);
      expect(updated.thumbnails).to.be.an('array');
      expect(updated.thumbnails.length).to.be.at.least(1);
      const lastThumb = updated.thumbnails[updated.thumbnails.length - 1];
      expect(lastThumb.path || lastThumb).to.equal('/uploads/product-image.jpg');
    });

    it('debería fallar si no se adjunta archivo', async () => {
      const created = await ProductService.create(mockProduct);

      try {
        await ProductService.addThumbnail(created._id, null);
        expect.fail('Debería haber lanzado error por falta de archivo');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(400);
      }
    });
  });
});