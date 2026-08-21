import { expect } from 'chai';
import mongoose from 'mongoose';
import { connectDB } from '../../src/config/db.js';

describe('Database Connection Unit Tests', () => {

  it('debería existir la función connectDB', () => {
    expect(connectDB).to.be.a('function');
  });

  it('debería conectarse exitosamente a MongoDB cuando mongoose.connect resuelve', async () => {
    const originalConnect = mongoose.connect;
    let connectedCalled = false;

    // Mockeamos mongoose.connect para que simule una conexión exitosa
    mongoose.connect = async (uri) => {
      connectedCalled = true;
      return Promise.resolve();
    };

    try {
      await connectDB();
      expect(connectedCalled).to.be.true;
    } finally {
      mongoose.connect = originalConnect; // Restauramos la función original
    }
  });

});