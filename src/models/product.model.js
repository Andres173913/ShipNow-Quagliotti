import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  originalName: { type: String},
  generatedName: { type: String},
  path: { type: String},
  mimetype: { type: String},
  size: { type: Number},
  documentType: { type: String, default: 'general' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, required: true },
  status: { type: Boolean, default: true },
  thumbnails: [documentSchema]
}, { timestamps: true });

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;