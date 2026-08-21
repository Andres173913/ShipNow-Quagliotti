import { expect } from 'chai';
import UserController from '../../src/controllers/users.controller.js'; // Ajustá la ruta según tu estructura
import UserService from '../../src/services/users.service.js';

describe('User Controller Unit Tests', () => {

  describe('getAll', () => {
    it('debería retornar un status 200 y la lista de usuarios', async () => {
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
      const next = (err) => { throw err; };

      const fakeUsers = [{ _id: '1', email: 'test@test.com' }];
      const originalGetAll = UserService.getAll;
      UserService.getAll = async () => fakeUsers;

      try {
        await UserController.getAll(req, res, next);
      } finally {
        UserService.getAll = originalGetAll;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeUsers);
    });

    it('debería delegar el error a next si UserService.getAll falla', async () => {
      const req = {};
      const res = {};
      let errorCaptured = null;
      const next = (err) => { errorCaptured = err; };

      const originalGetAll = UserService.getAll;
      UserService.getAll = async () => { throw new Error('Database error'); };

      try {
        await UserController.getAll(req, res, next);
      } finally {
        UserService.getAll = originalGetAll;
      }

      expect(errorCaptured).to.exist;
      expect(errorCaptured.message).to.equal('Database error');
    });
  });

  describe('getById', () => {
    it('debería retornar un status 200 y el usuario correspondiente si existe', async () => {
      const req = { params: { id: '123' } };
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

      const fakeUser = { _id: '123', email: 'user@test.com' };
      const originalGetById = UserService.getById;
      UserService.getById = async (id) => {
        if (id === '123') return fakeUser;
        throw new Error('Not found');
      };

      try {
        await UserController.getById(req, res, next);
      } finally {
        UserService.getById = originalGetById;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.payload).to.deep.equal(fakeUser);
    });
  });

  describe('login', () => {
    it('debería configurar la cookie access_token y retornar 200 con el usuario y token', async () => {
      const req = { body: { email: 'test@test.com', password: '123' } };
      let responseStatus = null;
      let responseBody = null;
      let cookieName = null;
      let cookieValue = null;

      const res = {
        status: (code) => {
          responseStatus = code;
          return {
            json: (data) => { responseBody = data; }
          };
        },
        cookie: (name, value, options) => {
          cookieName = name;
          cookieValue = value;
        }
      };
      const next = (err) => { throw err; };

      const fakeData = { user: { email: 'test@test.com' }, token: 'mock-jwt-token' };
      const originalLogin = UserService.login;
      UserService.login = async () => fakeData;

      try {
        await UserController.login(req, res, next);
      } finally {
        UserService.login = originalLogin;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.token).to.equal('mock-jwt-token');
      expect(cookieName).to.equal('access_token');
      expect(cookieValue).to.equal('mock-jwt-token');
    });
  });

});