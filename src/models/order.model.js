import mongoose from 'mongoose';
import { ORDER_STATUS } from '../constants/order.js';

const documentSchema = new mongoose.Schema({
  originalName: { type: String },
  generatedName: { type: String },
  path: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  documentType: { type: String, default: 'general' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: [...Object.values(ORDER_STATUS), 'pending', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'],
    default: ORDER_STATUS.PENDING
  },
  total_price: { type: Number, required: true, min: 0 },
  total: { type: Number, min: 0 },
  delivery_address: { type: String, required: true },
  receipts: [documentSchema]
}, { timestamps: true });

orderSchema.pre('validate', function () {
  if (!this.client && this.userId) this.client = this.userId;
  if (!this.userId && this.client) this.userId = this.client;

  if (this.total_price === undefined && this.total !== undefined) this.total_price = this.total;
  if (this.total === undefined && this.total_price !== undefined) this.total = this.total_price;

  if (!this.courier && this.courierId) this.courier = this.courierId;
  if (!this.courierId && this.courier) this.courierId = this.courier;

  if ((this.client || this.total_price !== undefined) && !this.delivery_address) {
    this.delivery_address = 'Dirección no especificada';
  }
});

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;