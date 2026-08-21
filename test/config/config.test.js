import { expect } from 'chai';
import { config } from '../../src/config/config.js';

describe('Config Module Unit Tests', () => {

  it('debería exportar un objeto de configuración válido', () => {
    expect(config).to.be.an('object');
  });

  it('debería contener las propiedades obligatorias de entorno', () => {
    expect(config).to.have.property('PORT');
    expect(config).to.have.property('NODE_ENV');
    expect(config).to.have.property('MONGO_URI');
    expect(config).to.have.property('JWT_SECRET');
  });

  it('debería tener valores por defecto asignados para propiedades opcionales si no están definidas', () => {
    expect(config.SALT_ROUNDS).to.exist;
    expect(config.JWT_EXPIRES_IN).to.be.a('string');
  });

});