import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import UserModel from '../../src/models/user.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';

describe('Users Routes Integration Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;
  let mockUserData;

  beforeEach(async () => {
    // Limpiar colección de usuarios
    await UserModel.deleteMany({});

    // Generar datos con MockService
    const [adminData, userData, newUserData] = MockService.generateMockUsers(3);
    mockUserData = newUserData;

    // Crear usuario administrador
    adminData.role = USER_ROLES.ADMIN;
    adminUser = await UserModel.create(adminData);
    adminToken = generateToken({
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Crear usuario regular
    userData.role = USER_ROLES.USER;
    regularUser = await UserModel.create(userData);
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

    it('debería retornar 400 y estructura de error si faltan campos obligatorios', async () => {
      const invalidPayload = {
        // Omitimos email, password u otros campos requeridos
        first_name: 'Test'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidPayload);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
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

    it('debería denegar el acceso (403/401) si un usuario regular intenta listar todos los usuarios', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', [`access_token=${regularToken}`]);

      expect(response.status).to.be.oneOf([401, 403]);
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

    it('debería retornar 404 y estructura de error al consultar un ID con formato válido pero inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId(); // ID sintácticamente válido de Mongo pero no registrado

      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });

    it('debería retornar 404 al consultar una ruta de API inexistente', async () => {
      const response = await request(app)
        .get('/api/ruta-que-no-existe-12345');

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('status', 'error');
      expect(response.body).to.have.property('message');
    });
  });

});