import { expect } from 'chai';
import { hashPassword, comparePassword } from '../../src/utils/crypto.utils.js';
import MockService from '../../src/mocks/services/mock.service.js';

describe('Crypto Utils Unit Tests', () => {
  let randomPassword;

  beforeEach(() => {
    // Generar una contraseña completamente aleatoria usando MockService
    const [generatedUser] = MockService.generateMockUsers(1);
    randomPassword = generatedUser.password;
  });

  describe('hashPassword()', () => {
    it('debería retornar un hash que sea un string diferente a la contraseña original', async () => {
      const hashedPassword = await hashPassword(randomPassword);

      expect(hashedPassword).to.be.a('string');
      expect(hashedPassword).to.not.equal(randomPassword);
      expect(hashedPassword).to.not.be.empty;
    });
  });

  describe('comparePassword()', () => {
    it('debería retornar true si la contraseña coincide con su hash', async () => {
      const hashedPassword = await hashPassword(randomPassword);
      const isMatch = await comparePassword(randomPassword, hashedPassword);

      expect(isMatch).to.be.true;
    });

    it('debería retornar false si la contraseña es incorrecta', async () => {
      const hashedPassword = await hashPassword(randomPassword);
      const [anotherUser] = MockService.generateMockUsers(1);
      
      // Intentamos comparar con una contraseña distinta generada al azar
      const isMatch = await comparePassword(anotherUser.password, hashedPassword);

      expect(isMatch).to.be.false;
    });
  });

});