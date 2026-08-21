import { expect } from 'chai';
import CartService from '../../src/services/cart.service.js';
import MockService from '../../src/mocks/services/mock.service.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import {CartModel} from '../../src/models/cart.model.js';
import { AppError } from '../../src/errors/index.js';

describe('CartService Integration Tests', () => {
  let testUser;
  let testProduct;

  beforeEach(async () => {
    // 1. Limpiar colecciones relacionadas antes de cada test
    await CartModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    // 2. Crear un usuario de prueba
    const [userData] = MockService.generateMockUsers(1);
    testUser = await UserModel.create(userData);

    // 3. Crear un producto con stock suficiente
    const [productData] = MockService.generateMockProducts(1);
    productData.stock = 10;
    testProduct = await ProductModel.create(productData);
  });

  describe('getCartByUserId()', () => {
    it('debería crear y retornar un carrito vacío si el usuario no tiene uno', async () => {
      const cart = await CartService.getCartByUserId(testUser._id);

      expect(cart).to.have.property('_id');
      expect(cart.userId.toString()).to.equal(testUser._id.toString());
      expect(cart.products).to.be.an('array').that.is.empty;
    });
  });

  describe('addProductToCart()', () => {
    it('debería agregar un producto al carrito correctamente', async () => {
      const updatedCart = await CartService.addProductToCart(testUser._id, testProduct._id, 2);

      expect(updatedCart.products).to.have.lengthOf(1);
      expect(updatedCart.products[0].quantity).to.equal(2);
    });

    it('debería fallar si el producto no existe', async () => {
      const fakeProductId = '507f1f77bcf86cd799439011';

      try {
        await CartService.addProductToCart(testUser._id, fakeProductId, 1);
        expect.fail('Debería haber fallado por producto inexistente');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
      }
    });

    it('debería fallar si la cantidad supera el stock disponible', async () => {
      try {
        await CartService.addProductToCart(testUser._id, testProduct._id, 15); // Stock es 10
        expect.fail('Debería haber fallado por stock insuficiente');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('Stock insuficiente');
      }
    });
  });

  describe('clearCart()', () => {
    it('debería vaciar el carrito correctamente', async () => {
      // Primero agregamos un producto
      await CartService.addProductToCart(testUser._id, testProduct._id, 2);

      // Luego vaciamos el carrito
      const clearedCart = await CartService.clearCart(testUser._id);

      expect(clearedCart.products).to.be.an('array').that.is.empty;
    });

    it('debería fallar si el carrito no existe al intentar vaciarlo', async () => {
      const [anotherUser] = MockService.generateMockUsers(1);
      const savedUser = await UserModel.create(anotherUser);

      try {
        await CartService.clearCart(savedUser._id);
        expect.fail('Debería haber fallado porque no existe el carrito');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
      }
    });
  });

});