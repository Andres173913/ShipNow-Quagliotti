import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Un carrito por usuario (o adaptarlo a tu lógica de negocio)
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad mínima para un producto es 1']
      }
    }
  ]
}, {
  timestamps: true,
  versionKey: false
});

export const CartModel = model('Cart', cartSchema);