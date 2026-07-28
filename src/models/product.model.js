import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  code: {type: String, required: true, unique: true},
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, required: true },
  status:{type: Boolean, default: true},
  thumbnails:{type: [String], default: []}
}, { timestamps: true }); // timestamps añade createdAt y updatedAt automáticamente

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;