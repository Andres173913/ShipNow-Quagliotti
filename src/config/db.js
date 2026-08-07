import mongoose from 'mongoose';

import { config } from './config.js';
import logger from './logger.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.fatal('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}