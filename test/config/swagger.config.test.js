import { expect } from 'chai';
import { swaggerSpec } from '../../src/config/swagger.config.js'; // Ajustá la ruta según tu estructura

describe('Swagger Configuration Unit Tests', () => {

  it('debería generar una especificación OpenAPI válida', () => {
    expect(swaggerSpec).to.be.an('object');
    expect(swaggerSpec).to.have.property('openapi', '3.0.0');
  });

  it('debería contener la información general de la API (info)', () => {
    expect(swaggerSpec).to.have.property('info');
    expect(swaggerSpec.info).to.have.property('title', 'ShipNow API');
    expect(swaggerSpec.info).to.have.property('version', '1.0.0');
    expect(swaggerSpec.info).to.have.property('description');
  });

  it('debería registrar los tags principales de la aplicación', () => {
    expect(swaggerSpec).to.have.property('tags');
    expect(swaggerSpec.tags).to.be.an('array');

    const tagNames = swaggerSpec.tags.map(tag => tag.name);
    expect(tagNames).to.include.members(['Health', 'Users', 'Orders', 'Products', 'Mocks', 'Carts']);
  });

  it('debería configurar correctamente los componentes de seguridad y esquemas', () => {
    expect(swaggerSpec).to.have.property('components');
    expect(swaggerSpec.components).to.have.property('securitySchemes');
    expect(swaggerSpec.components.securitySchemes).to.have.property('cookieAuth');
    
    const cookieAuth = swaggerSpec.components.securitySchemes.cookieAuth;
    expect(cookieAuth).to.have.property('type', 'apiKey');
    expect(cookieAuth).to.have.property('in', 'cookie');
    expect(cookieAuth).to.have.property('name', 'token');

    expect(swaggerSpec.components).to.have.property('schemas');
    expect(swaggerSpec.components).to.have.property('responses');
    expect(swaggerSpec.components).to.have.property('parameters');
  });

});