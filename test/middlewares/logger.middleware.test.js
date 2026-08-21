import { expect } from 'chai';
import { addLogger } from '../../src/middlewares/logger.middleware.js'; // Ajustá la ruta según tu estructura

describe('Logger Middleware Unit Tests', () => {

  it('debería inyectar req.logger, registrar la petición HTTP y llamar a next()', (done) => {
    const req = {
      method: 'GET',
      url: '/api/test'
    };
    
    const res = {};
    
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    // Ejecutamos el middleware
    addLogger(req, res, next);

    // Verificaciones
    expect(req.logger).to.exist;
    expect(req.logger).to.have.property('http');
    expect(nextCalled).to.be.true;
    
    done();
  });

});