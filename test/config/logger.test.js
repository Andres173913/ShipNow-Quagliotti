import { expect } from 'chai';
import logger from '../../src/config/logger.js';

describe('Winston Logger Unit Tests', () => {

  it('debería ser una instancia de logger válida', () => {
    expect(logger).to.be.an('object');
    expect(logger).to.have.property('log');
  });

  it('debería contener todos los niveles de severidad personalizados', () => {
    expect(logger).to.have.property('fatal').that.is.a('function');
    expect(logger).to.have.property('error').that.is.a('function');
    expect(logger).to.have.property('warn').that.is.a('function');
    expect(logger).to.have.property('info').that.is.a('function');
    expect(logger).to.have.property('http').that.is.a('function');
    expect(logger).to.have.property('debug').that.is.a('function');
  });

  it('debería permitir registrar un mensaje sin arrojar errores', () => {
    // Probamos que invocar los métodos del logger no genere excepciones en runtime
    expect(() => {
      logger.info('Test log informativo desde la suite de pruebas');
    }).not.to.throw();
  });

});