import { expect } from 'chai';
import mongoose from 'mongoose';
import { CartModel } from '../../src/models/cart.model.js';

describe('Cart Model Validation Tests', () => {

  beforeEach(async () => {
    await CartModel.deleteMany({});
  });

  describe('Esquema y Campos Requeridos', () => {
    it('debería fallar si se intenta crear un carrito sin userId', async () => {
      const cartWithoutUser = new CartModel({
        products: []
      });

      let err;
      try {
        await cartWithoutUser.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors.userId).to.exist;
    });

    it('debería crear un carrito correctamente con un usuario y un array de productos válido', async () => {
      const cartData = {
        userId: new mongoose.Types.ObjectId(),
        products: [
          {
            productId: new mongoose.Types.ObjectId(),
            quantity: 3
          }
        ]
      };

      const cart = new CartModel(cartData);
      const savedCart = await cart.save();

      expect(savedCart._id).to.exist;
      expect(savedCart.userId).to.deep.equal(cartData.userId);
      expect(savedCart.products).to.have.lengthOf(1);
      expect(savedCart.products[0].quantity).to.equal(3);
      expect(savedCart.createdAt).to.exist;
      expect(savedCart.updatedAt).to.exist;
    });
  });

  describe('Restricciones y Validaciones Internas', () => {
    it('debería fallar si se intenta registrar más de un carrito para el mismo userId (unique)', async () => {
      const sameUserId = new mongoose.Types.ObjectId();

      const cartOne = {
        userId: sameUserId,
        products: []
      };

      const cartTwo = {
        userId: sameUserId,
        products: []
      };

      // Creamos el primer carrito
      await CartModel.create(cartOne);

      let err;
      try {
        // Intentamos crear otro carrito con el mismo userId
        await CartModel.create(cartTwo);
      } catch (error) {
        err = error;
      }

      expect(err).to.exist;
      expect(err.code).to.equal(11000); // Código de error de MongoDB para índice único duplicado
    });

    it('debería fallar si la cantidad de un producto en el carrito es menor a 1 (min: 1)', async () => {
      const invalidCartData = {
        userId: new mongoose.Types.ObjectId(),
        products: [
          {
            productId: new mongoose.Types.ObjectId(),
            quantity: 0 // Menor al mínimo permitido
          }
        ]
      };

      const cart = new CartModel(invalidCartData);

      let err;
      try {
        await cart.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors['products.0.quantity']).to.exist;
    });

    it('debería fallar si falta productId o quantity dentro de los productos del carrito', async () => {
      const invalidCartData = {
        userId: new mongoose.Types.ObjectId(),
        products: [
          {
            // Faltan ambos campos obligatorios del subdocumento
          }
        ]
      };

      const cart = new CartModel(invalidCartData);

      let err;
      try {
        await cart.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors['products.0.productId']).to.exist;
      expect(err.errors['products.0.quantity']).to.exist;
    });
  });

});