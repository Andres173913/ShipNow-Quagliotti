import { expect } from 'chai';
import mongoose from 'mongoose';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js'; // Ajustá la ruta según tu estructura

describe('Product Model Validation Tests', () => {

  beforeEach(async () => {
    await ProductModel.deleteMany({});
  });

  describe('Esquema y Campos Requeridos', () => {
    it('debería fallar si se intenta crear un producto sin los campos obligatorios', async () => {
      const productWithoutRequiredField = new ProductModel({});

      let err;
      try {
        await productWithoutRequiredField.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors.title).to.exist;
      expect(err.errors.description).to.exist;
      expect(err.errors.price).to.exist;
      expect(err.errors.code).to.exist;
      expect(err.errors.category).to.exist;
    });

    it('debería asignar los valores por defecto correctamente (status)', async () => {
      const [mockProduct] = MockService.generateMockProducts(1);
      
      const product = new ProductModel({
        ...mockProduct,
        thumbnails: undefined
    });

      const savedProduct = await product.save();
      expect(savedProduct.status).to.be.true;
      expect(savedProduct.thumbnails).to.be.an('array').that.is.empty;
      expect(savedProduct.createdAt).to.exist;
      expect(savedProduct.updatedAt).to.exist;
    });
  });

  describe('Validaciones de Rango y Unicidad', () => {
    it('debería fallar si el precio o el stock son menores a 0 (min: 0)', async () => {
      const [mockProduct] = MockService.generateMockProducts(1);
      
      const productWithNegativeValues = new ProductModel({
        ...mockProduct,
        price: -50,
        stock: -5
      });

      let err;
      try {
        await productWithNegativeValues.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors.price).to.exist;
      expect(err.errors.stock).to.exist;
    });

    it('debería fallar si se intenta registrar un producto con un código duplicado (unique)', async () => {
      const [productOne, productTwo] = MockService.generateMockProducts(2);

      // Creamos el primer producto
      await ProductModel.create(productOne);

      // Intentamos crear otro usando el mismo código de productOne pero el resto de productTwo
      const duplicateProduct = new ProductModel({
        ...productTwo,
        code: productOne.code // Forzamos el código duplicado
      });

      let err;
      try {
        await duplicateProduct.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.exist;
      expect(err.code).to.equal(11000);
    });

    it('debería fallar si se intenta registrar un producto con un título duplicado (unique)', async () => {
      const [productOne, productTwo] = MockService.generateMockProducts(2);

      await ProductModel.create(productOne);

      // Forzamos el título duplicado con otro código distinto para aislar la prueba
      const duplicateProduct = new ProductModel({
        ...productTwo,
        title: productOne.title
      });

      let err;
      try {
        await duplicateProduct.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.exist;
      expect(err.code).to.equal(11000);
    });
  });

});