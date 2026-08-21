import { expect } from 'chai';
import MockController from '../../../src/mocks/controller/mocks.controller.js';
import MockService from '../../../src/mocks/services/mock.service.js';

describe('Mock Controller Unit Tests', () => {

  describe('getMockUsers', () => {
    it('debería retornar un status 200 y los usuarios mockeados si el count es válido', async () => {
      const req = { query: { count: '3' } };
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
      const next = (err) => { throw err; };

      // Mockeamos temporalmente el método del servicio
      const originalGenerate = MockService.generateMockUsers;
      const fakeUsers = [{ first_name: 'Test' }];
      MockService.generateMockUsers = () => fakeUsers;

      try {
        await MockController.getMockUsers(req, res, next);
      } finally {
        MockService.generateMockUsers = originalGenerate; // Restauramos el método original
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeUsers);
    });

    it('debería disparar un error si el count excede el límite', async () => {
      const req = { query: { count: '100' } }; // Excede el límite de 50
      const res = {};
      let errorCaptured = null;
      const next = (err) => { errorCaptured = err; };

      await MockController.getMockUsers(req, res, next);

      expect(errorCaptured).to.exist;
    });
  });

});