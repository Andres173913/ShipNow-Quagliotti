import { expect } from 'chai';
import CartRepository from '../../src/repositories/cart.repository.js';
import { CartModel } from '../../src/models/cart.model.js';
import UserModel from '../../src/models/user.model.js';
import ProductModel from '../../src/models/product.model.js';
import MockService from '../../src/mocks/services/mock.service.js';

describe('CartRepository Integration Tests', () => {
  let testUser;
  let testProduct;

  beforeEach(async () => {
    await CartModel.deleteMany({});
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});

    const [userData] = MockService.generateMockUsers(1);
    const [productData] = MockService.generateMockProducts(1);

    testUser = await UserModel.create(userData);
    testProduct = await ProductModel.create(productData);
  });

  describe('create() y findByUserId()', () => {
    it('debería crear un carrito y encontrarlo por el ID del usuario con productos populados', async () => {
      const newCart = await CartRepository.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 2 }]
      });

      expect(newCart).to.have.property('_id');

      const foundCart = await CartRepository.findByUserId(testUser._id);
      expect(foundCart).to.not.be.null;
      expect(foundCart.userId.toString()).to.equal(testUser._id.toString());
      expect(foundCart.products[0].productId).to.have.property('title');
      expect(foundCart.products[0].quantity).to.equal(2);
    });
  });

  describe('save()', () => {
    it('debería guardar los cambios de una instancia de carrito existente', async () => {
      const cart = await CartRepository.create({
        userId: testUser._id,
        products: []
      });

      cart.products.push({ productId: testProduct._id, quantity: 5 });
      const savedCart = await CartRepository.save(cart);

      expect(savedCart.products.length).to.equal(1);
      expect(savedCart.products[0].quantity).to.equal(5);
    });
  });

  describe('findOneAndUpdate()', () => {
    it('debería actualizar un carrito y retornar el documento modificado', async () => {
      await CartRepository.create({
        userId: testUser._id,
        products: [{ productId: testProduct._id, quantity: 1 }]
      });

      const updatedCart = await CartRepository.findOneAndUpdate(
        { userId: testUser._id },
        { products: [] },
        { new: true }
      );

      expect(updatedCart.products).to.be.an('array').that.is.empty;
    });
  });

});