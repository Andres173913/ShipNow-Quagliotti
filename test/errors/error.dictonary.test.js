import { expect } from 'chai';
import { errorsDictionary } from '../../src/errors/error.dictionary.js';
import { ERROR_CODES } from '../../src/errors/error-codes.js';

describe('Errors Dictionary Unit Tests', () => {

  it('debería ser un objeto congelado (immutable)', () => {
    expect(Object.isFrozen(errorsDictionary)).to.be.true;
  });

  it('debería contener las propiedades statusCode y message para cada entrada', () => {
    for (const key of Object.keys(ERROR_CODES)) {
      const codeValue = ERROR_CODES[key];
      // Verificamos solo las llaves que estén definidas en el diccionario
      if (errorsDictionary[codeValue]) {
        const errorEntry = errorsDictionary[codeValue];
        expect(errorEntry).to.have.property('statusCode').that.is.a('number');
        expect(errorEntry).to.have.property('message').that.is.a('string');
      }
    }
  });

  it('debería retornar el status 404 y mensaje correcto para USER_NOT_FOUND', () => {
    const errorConfig = errorsDictionary[ERROR_CODES.USER_NOT_FOUND];
    
    expect(errorConfig).to.exist;
    expect(errorConfig.statusCode).to.equal(404);
    expect(errorConfig.message).to.equal('Usuario no encontrado');
  });

  it('debería retornar el status 400 y mensaje correcto para VALIDATION_ERROR', () => {
    const errorConfig = errorsDictionary[ERROR_CODES.VALIDATION_ERROR];
    
    expect(errorConfig).to.exist;
    expect(errorConfig.statusCode).to.equal(400);
    expect(errorConfig.message).to.equal('Los datos enviados no son validos');
  });

});