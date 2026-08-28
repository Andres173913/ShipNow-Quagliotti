import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/roles.js';

const documentSchema = new mongoose.Schema({
  originalName: { type: String},
  generatedName: { type: String},
  path: { type: String},
  mimetype: { type: String},
  size: { type: Number},
  documentType: { type: String, default: 'general' }, // Ej: 'dni', 'license', etc.
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: USER_ROLES.USER },
  // Aquí guardamos exclusivamente los metadatos y la ruta de referencia al archivo del servidor
  documents: [documentSchema]
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;