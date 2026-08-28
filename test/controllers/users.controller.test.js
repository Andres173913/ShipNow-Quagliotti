import { expect } from 'chai';
import UserController from '../../src/controllers/users.controller.js';
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

  describe('getByEmail', () => {
    it('debería retornar un status 200 y el usuario correspondiente buscando por query email', async () => {
      const req = { query: { email: 'user@test.com' } };
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
      const originalGetByEmail = UserService.getByEmail;
      UserService.getByEmail = async (email) => {
        if (email === 'user@test.com') return fakeUser;
        throw new Error('Not found');
      };

      try {
        await UserController.getByEmail(req, res, next);
      } finally {
        UserService.getByEmail = originalGetByEmail;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeUser);
    });
  });

  describe('create', () => {
    it('debería retornar un status 201 y el usuario creado', async () => {
      const req = { 
        body: { 
          first_name: 'Juan', 
          last_name: 'Pérez', 
          email: 'juan@test.com', 
          password: 'Password123!' 
        } 
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
      const next = (err) => { throw err; };

      const fakeCreatedUser = { _id: '456', ...req.body };
      const originalCreate = UserService.create;
      UserService.create = async (userData) => fakeCreatedUser;

      try {
        await UserController.create(req, res, next);
      } finally {
        UserService.create = originalCreate;
      }

      expect(responseStatus).to.equal(201);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeCreatedUser);
    });
  });

  describe('update', () => {
    it('debería retornar un status 200 y el usuario actualizado', async () => {
      const req = { params: { id: '123' }, body: { first_name: 'Actualizado' } };
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

      const fakeUpdatedUser = { _id: '123', first_name: 'Actualizado' };
      const originalUpdate = UserService.update;
      UserService.update = async (id, data) => fakeUpdatedUser;

      try {
        await UserController.update(req, res, next);
      } finally {
        UserService.update = originalUpdate;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.payload).to.deep.equal(fakeUpdatedUser);
    });
  });

  describe('delete', () => {
    it('debería retornar un status 200 con mensaje de éxito al eliminar un usuario', async () => {
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

      const originalDelete = UserService.delete;
      UserService.delete = async (id) => ({ _id: id });

      try {
        await UserController.delete(req, res, next);
      } finally {
        UserService.delete = originalDelete;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.equal('User deleted successfully');
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

  describe('uploadDocument', () => {
    it('debería retornar un status 200 y el usuario actualizado al subir un documento', async () => {
      const req = { 
        params: { id: '123' }, 
        body: { documentType: 'dni' },
        file: { originalname: 'dni.pdf', filename: 'gen-dni.pdf', path: '/uploads/gen-dni.pdf', mimetype: 'application/pdf', size: 1024 } 
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
      const next = (err) => { throw err; };

      const fakeUpdatedUser = { _id: '123', documents: [req.file] };
      const originalUploadDocument = UserService.uploadDocument;
      UserService.uploadDocument = async (id, file, documentType) => fakeUpdatedUser;

      try {
        await UserController.uploadDocument(req, res, next);
      } finally {
        UserService.uploadDocument = originalUploadDocument;
      }

      expect(responseStatus).to.equal(200);
      expect(responseBody.status).to.equal('success');
      expect(responseBody.message).to.include('Documento subido');
      expect(responseBody.payload).to.deep.equal(fakeUpdatedUser);
    });
  });

});