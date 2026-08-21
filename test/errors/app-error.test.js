import { expect } from 'chai';
import { AppError } from '../../src/errors/app-error.js'; // Ajustá la ruta según tu estructura
import { ERROR_CODES } from '../../src/errors/error-codes.js';

describe('AppError Class Unit Tests', () => {

  it('debería crear una instancia de AppError con el status code y mensaje por defecto del diccionario', () => {
    const error = new AppError(ERROR_CODES.USER_NOT_FOUND);

    expect(error).to.be.an.instanceOf(Error);
    expect(error).to.be.an.instanceOf(AppError);
    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal('Usuario no encontrado');
    expect(error.code).to.equal(ERROR_CODES.USER_NOT_FOUND);
    expect(error.isOperational).to.be.true;
    expect(error.details).to.be.null;
  });

  it('debería permitir sobreescribir el mensaje por defecto con uno personalizado', () => {
    const customMsg = 'El usuario con ID 999 no existe en el sistema.';
    const error = new AppError(ERROR_CODES.USER_NOT_FOUND, customMsg);

    expect(error.statusCode).to.equal(404);
    expect(error.message).to.equal(customMsg);
    expect(error.code).to.equal(ERROR_CODES.USER_NOT_FOUND);
  });

  it('debería incluir detalles adicionales si son provistos', () => {
    const details = { field: 'email', reason: 'already registered' };
    const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Error de validación', details);

    expect(error.statusCode).to.equal(400);
    expect(error.details).to.deep.equal(details);
  });

  it('debería recurrir a INTERNAL_SERVER_ERROR si se pasa un código inexistente', () => {
    const error = new AppError('CODIGO_QUE_NO_EXISTE');

    expect(error.statusCode).to.equal(500);
    expect(error.message).to.equal('Error en el servidor');
    expect(error.code).to.equal('INTERNAL_SERVER_ERROR');
  });

});