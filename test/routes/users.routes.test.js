import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import UserModel from '../../src/models/user.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import UserService from '../../src/services/users.service.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';

describe('Users Routes Integration Tests', () => {
  let adminUser;
  let courierUser;
  let regularUser;
  let adminToken;
  let courierToken;
  let regularToken;
  let mockUserData;

  beforeEach(async () => {
    // Limpiar colección de usuarios
    await UserModel.deleteMany({});

    // Generar datos con MockService
    const [adminData, courierData, userData, newUserData] = MockService.generateMockUsers(4);
    mockUserData = newUserData;
    // Asegurar contraseña en texto plano si el modelo la hashea en pre-save o se usa directo en login
    mockUserData.password = 'Password123!';

    // Crear usuario administrador
    adminData.role = USER_ROLES.ADMIN;
    adminData.password = 'Password123!';
    adminUser = await UserService.create(adminData);
    adminToken = generateToken({
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Crear usuario courier
    courierData.role = USER_ROLES.COURIER;
    courierData.password = 'Password123!';
    courierUser = await UserService.create(courierData);
    courierToken = generateToken({
      id: courierUser._id,
      email: courierUser.email,
      role: courierUser.role
    });

    // Crear usuario regular
    userData.role = USER_ROLES.USER;
    userData.password = 'Password123!';
    regularUser = await UserService.create(userData);
    regularToken = generateToken({
      id: regularUser._id,
      email: regularUser.email,
      role: regularUser.role
    });
  });

  describe('POST /api/users', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(mockUserData);

      expect(response.status).to.be.oneOf([200, 201]);
      const createdUser = response.body.payload || response.body;
      expect(createdUser).to.have.property('_id');
      expect(createdUser.email).to.equal(mockUserData.email);
    });

    it('debería retornar 400 si faltan campos obligatorios', async () => {
      const invalidPayload = { first_name: 'Test' };
      const response = await request(app)
        .post('/api/users')
        .send(invalidPayload);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('status', 'error');
    });
  });

  describe('POST /api/users/login', () => {
    it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: regularUser.email,
          password: 'Password123!'
        });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('status', 'success');
    });

    it('debería fallar el login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: regularUser.email,
          password: 'WrongPassword'
        });

      expect(response.status).to.be.oneOf([400, 401]);
      expect(response.body).to.have.property('status', 'error');
    });
  });

  describe('GET /api/users', () => {
    it('debería permitir listar usuarios si el rol es ADMIN', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(200);
      const usersList = response.body.payload || response.body;
      expect(usersList).to.be.an('array');
    });

    it('debería permitir listar usuarios si el rol es COURIER', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', [`access_token=${courierToken}`]);

      expect(response.status).to.equal(200);
      const usersList = response.body.payload || response.body;
      expect(usersList).to.be.an('array');
    });

    it('debería denegar el acceso si un usuario regular intenta listar todos los usuarios', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('GET /api/users/search', () => {
    it('debería buscar un usuario por email exitosamente', async () => {
      const response = await request(app)
        .get(`/api/users/search?email=${regularUser.email}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(200);
      const foundUser = response.body.payload || response.body;
      expect(foundUser.email).to.equal(regularUser.email);
    });
  });

  describe('GET /api/users/:id', () => {
    it('debería retornar un usuario por su ID si está autenticado', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.equal(200);
      const foundUser = response.body.payload || response.body;
      expect(foundUser.email).to.equal(regularUser.email);
    });

    it('debería retornar 404 para un ID válido pero inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('debería actualizar los datos de un usuario por ID', async () => {
      const response = await request(app)
        .patch(`/api/users/${regularUser._id}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ first_name: 'UpdatedName' });

      expect(response.status).to.equal(200);
      const updatedUser = response.body.payload || response.body;
      expect(updatedUser.first_name).to.equal('UpdatedName');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('debería permitir a un ADMIN eliminar un usuario', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('debería denegar la eliminación si el usuario no es ADMIN', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
    });
  });

  describe('POST /api/users/:id/documents', () => {
    it('debería permitir subir un documento al usuario', async () => {
      const response = await request(app)
        .post(`/api/users/${regularUser._id}/documents`)
        .set('Cookie', [`access_token=${regularToken}`])
        .attach('document', Buffer.from('contenido de prueba del archivo'), 'identificacion.pdf');

      expect(response.status).to.be.oneOf([200, 201]);
    });
  });
});