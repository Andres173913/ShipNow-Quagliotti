import { expect } from 'chai';
import { ERROR_CODES } from '../../src/errors/error-codes.js'; // Ajustá la ruta según tu estructura

describe('Error Codes Unit Tests', () => {

  it('debería ser un objeto congelado (immutable)', () => {
    expect(Object.isFrozen(ERROR_CODES)).to.be.true;
  });

  it('debería contener los códigos de error esenciales', () => {
    expect(ERROR_CODES).to.have.property('VALIDATION_ERROR', 'VALIDATION_ERROR');
    expect(ERROR_CODES).to.have.property('USER_NOT_FOUND', 'USER_NOT_FOUND');
    expect(ERROR_CODES).to.have.property('INTERNAL_SERVER_ERROR', 'INTERNAL_SERVER_ERROR');
    expect(ERROR_CODES).to.have.property('ROUTE_NOT_FOUND', 'ROUTE_NOT_FOUND');
  });

  it('debería tener valores de tipo string para cada código', () => {
    for (const key of Object.keys(ERROR_CODES)) {
      expect(ERROR_CODES[key]).to.be.a('string');
    }
  });

});