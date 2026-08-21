import { expect } from 'chai';
import { notFoundHandler, errorHandler } from '../../src/middlewares/error.middleware.js'; // Ajustá la ruta según tu estructura
import { AppError } from '../../src/errors/app-error.js';
import { ERROR_CODES } from '../../src/errors/error-codes.js';

describe('Error Middlewares Unit Tests', () => {

  describe('notFoundHandler', () => {
    it('debería invocar a next con un AppError de ruta no encontrada', () => {
      const req = {};
      const res = {};
      let errorPassed = null;

      const next = (err) => {
        errorPassed = err;
      };

      notFoundHandler(req, res, next);

      expect(errorPassed).to.be.an.instanceOf(AppError);
      expect(errorPassed.statusCode).to.equal(404); // O el código que tengas configurado para ROUTE_NOT_FOUND
    });
  });

  describe('errorHandler', () => {
    it('debería responder con el status y estructura correcta cuando recibe un AppError', () => {
      const customError = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Datos inválidos');
      const req = {};
      
      let responseStatus = null;
      let responseBody = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };
      const next = () => {};

      errorHandler(customError, req, res, next);

      expect(responseStatus).to.equal(customError.statusCode);
      expect(responseBody).to.have.property('status', 'error');
      expect(responseBody).to.have.property('message', 'Datos inválidos');
    });

    it('debería manejar correctamente un error de Mongoose CastError (ID inválido)', () => {
      const castError = {
        name: 'CastError',
        value: 'invalid-id-123',
        path: '_id'
      };
      const req = {};
      
      let responseStatus = null;
      let responseBody = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        }
      };
      const next = () => {};

      errorHandler(castError, req, res, next);

      expect(responseStatus).to.equal(400);
      expect(responseBody).to.have.property('status', 'error');
      expect(responseBody).to.have.property('code', 'INVALID_ID');
      expect(responseBody.message).to.include('invalid-id-123');
    });
  });

});