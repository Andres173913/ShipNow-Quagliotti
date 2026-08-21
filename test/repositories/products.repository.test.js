import { expect } from 'chai';
import ProductRepository from '../../src/repositories/products.repository.js';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js';

describe('ProductRepository Integration Tests', () => {
  let mockProductData;

  beforeEach(async () => {
    await ProductModel.deleteMany({});
    const [productData] = MockService.generateMockProducts(1);
    mockProductData = productData;
  });

  describe('create()', () => {
    it('debería crear un producto en la base de datos', async () => {
      const createdProduct = await ProductRepository.create(mockProductData);

      expect(createdProduct).to.have.property('_id');
      expect(createdProduct.title).to.equal(mockProductData.title);
    });
  });

  describe('find() y findById()', () => {
    it('debería retornar todos los productos', async () => {
      await ProductRepository.create(mockProductData);
      const products = await ProductRepository.find();

      expect(products).to.be.an('array').that.is.not.empty;
      expect(products.length).to.equal(1);
    });

    it('debería encontrar un producto por su ID', async () => {
      const newProduct = await ProductRepository.create(mockProductData);
      const foundProduct = await ProductRepository.findById(newProduct._id);

      expect(foundProduct).to.not.be.null;
      expect(foundProduct._id.toString()).to.equal(newProduct._id.toString());
    });
  });

  describe('findByTitle()', () => {
    it('debería encontrar un producto por su título', async () => {
      await ProductRepository.create(mockProductData);
      const foundProduct = await ProductRepository.findByTitle(mockProductData.title);

      expect(foundProduct).to.not.be.null;
      expect(foundProduct.title).to.equal(mockProductData.title);
    });
  });

  describe('update()', () => {
    it('debería actualizar los datos de un producto', async () => {
      const newProduct = await ProductRepository.create(mockProductData);
      const updatedProduct = await ProductRepository.update(newProduct._id, { title: 'Producto Actualizado' });

      expect(updatedProduct.title).to.equal('Producto Actualizado');
    });
  });

  describe('delete()', () => {
    it('debería eliminar un producto por su ID', async () => {
      const newProduct = await ProductRepository.create(mockProductData);
      await ProductRepository.delete(newProduct._id);
      
      const foundProduct = await ProductRepository.findById(newProduct._id);
      expect(foundProduct).to.be.null;
    });
  });

});