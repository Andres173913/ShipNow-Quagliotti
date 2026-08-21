import { expect } from 'chai';
import { authenticateToken, authorizeRoles } from '../../src/middlewares/auth.middleware.js';
import { generateToken } from '../../src/utils/jwt.utils.js'; // Usamos la función real para generar un token válido

describe('Auth Middlewares Unit Tests', () => {

  describe('authenticateToken', () => {
    it('debería retornar 401 si no se provee ningún token (ni cookies ni headers)', () => {
      const req = {
        cookies: {},
        headers: {},
        method: 'GET',
        url: '/api/protected'
      };

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

      authenticateToken(req, res, next);

      expect(responseStatus).to.equal(401);
      expect(responseBody.message).to.include('No token provided');
    });

    it('debería retornar 403 si el token provisto es inválido o malformado', () => {
      const req = {
        cookies: { access_token: 'token.invalido.falso' },
        headers: {},
        method: 'GET',
        url: '/api/protected'
      };

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

      authenticateToken(req, res, next);

      expect(responseStatus).to.equal(403);
      expect(responseBody.message).to.include('Invalid or expired token');
    });

    it('debería inyectar req.user y llamar a next si el token es válido', () => {
      const fakeUserPayload = { id: '123', role: 'admin', email: 'test@test.com' };
      // Generamos un token real usando la utilidad del sistema
      const validToken = generateToken(fakeUserPayload);

      const req = {
        cookies: { access_token: validToken },
        headers: {}
      };

      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      authenticateToken(req, res, next);

      expect(nextCalled).to.be.true;
      expect(req.user).to.include({ id: fakeUserPayload.id, role: fakeUserPayload.role });
    });
  });

  describe('authorizeRoles', () => {
    it('debería retornar 500 si se usa authorizeRoles sin haber pasado por authenticateToken (req.user ausente)', () => {
      const req = { method: 'GET', url: '/api/admin' };
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

      const middleware = authorizeRoles('admin');
      middleware(req, res, next);

      expect(responseStatus).to.equal(500);
      expect(responseBody.message).to.include('Se requiere autenticación previa');
    });

    it('debería retornar 403 si el rol del usuario no está dentro de los permitidos', () => {
      const req = { user: { role: 'user', email: 'user@test.com' }, method: 'GET', url: '/api/admin' };
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

      const middleware = authorizeRoles('admin', 'courier');
      middleware(req, res, next);

      expect(responseStatus).to.equal(403);
      expect(responseBody.message).to.include('Acceso prohibido');
    });

    it('debería permitir el paso (llamar a next) si el rol del usuario está autorizado', () => {
      const req = { user: { role: 'admin', email: 'admin@test.com' } };
      const res = {};
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      const middleware = authorizeRoles('admin', 'courier');
      middleware(req, res, next);

      expect(nextCalled).to.be.true;
    });
  });

});