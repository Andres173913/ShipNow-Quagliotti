import { expect } from 'chai';
import ProductService from '../../src/services/products.service.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { AppError } from '../../src/errors/index.js';

describe('ProductService Integration Tests', () => {
  let mockProduct;

  beforeEach(() => {
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
      const fakeId = '507f1f77bcf86cd799439011'; // ID válido de Mongoose pero inexistente

      try {
        await ProductService.update(fakeId, { title: 'Nuevo Título' });
        expect.fail('Debería haber fallado por producto no encontrado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
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
      }
    });
  });

});