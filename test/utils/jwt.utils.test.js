import mongoose from 'mongoose';

import { expect } from 'chai';
import { generateToken, verifyToken } from '../../src/utils/jwt.utils.js';
import MockService from '../../src/mocks/services/mock.service.js';


describe('JWT Utils Unit Tests', () => {
  let mockPayload;

  beforeEach(() => {
    // Generar un usuario dinámico con MockService y un ObjectId real de Mongoose
    const [generatedUser] = MockService.generateMockUsers(1);
    mockPayload = {
      id: new mongoose.Types.ObjectId().toString(),
      email: generatedUser.email,
      role: generatedUser.role
    };
  });

  describe('generateToken()', () => {
    it('debería generar un token JWT válido de tipo string', () => {
      const token = generateToken(mockPayload);

      expect(token).to.be.a('string');
      expect(token).to.not.be.empty;
    });
  });

  describe('verifyToken()', () => {
    it('debería verificar un token válido y retornar el payload original', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded).to.be.an('object');
      expect(decoded.id).to.equal(mockPayload.id);
      expect(decoded.email).to.equal(mockPayload.email);
      expect(decoded.role).to.equal(mockPayload.role);
    });

    it('debería retornar null si el token es inválido o falso', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidtokenpayload';
      const decoded = verifyToken(invalidToken);

      expect(decoded).to.be.null;
    });
  });

});