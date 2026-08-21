import { expect } from 'chai';
import UserService from '../../src/services/users.service.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { AppError } from '../../src/errors/index.js';

describe('UserService Integration Tests', () => {
  let mockUser;

  beforeEach(() => {
    // Generar un usuario único usando MockService para cada prueba
    const [generatedUser] = MockService.generateMockUsers(1);
    mockUser = generatedUser;
  });

  describe('create() y getById()', () => {
    it('debería crear un usuario nuevo y poder buscarlo por su ID', async () => {
      const createdUser = await UserService.create(mockUser);

      expect(createdUser).to.have.property('_id');
      expect(createdUser.email).to.equal(mockUser.email);

      const foundUser = await UserService.getById(createdUser._id);
      expect(foundUser).to.not.be.null;
      expect(foundUser.email).to.equal(mockUser.email);
    });

    it('debería lanzar un error si se intenta registrar un email duplicado', async () => {
      // Creamos el usuario por primera vez
      await UserService.create(mockUser);

      // Intentamos crearlo de nuevo con el mismo email
      try {
        await UserService.create(mockUser);
        expect.fail('Debería haber lanzado error por email duplicado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('El email ya se encuentra registrado');
      }
    });
  });

  describe('getAll()', () => {
    it('debería retornar una lista con los usuarios existentes', async () => {
      await UserService.create(mockUser);

      const users = await UserService.getAll();

      expect(users).to.be.an('array');
      expect(users.length).to.be.greaterThan(0);
    });
  });

  describe('login()', () => {
    it('debería iniciar sesión correctamente y retornar un token JWT', async () => {
      // Guardamos la contraseña en texto plano antes de que se hashee en el create
      const rawPassword = mockUser.password;
      await UserService.create(mockUser);

      const loginResult = await UserService.login(mockUser.email, rawPassword);

      expect(loginResult).to.have.property('token');
      expect(loginResult).to.have.property('user');
      expect(loginResult.user.email).to.equal(mockUser.email);
      expect(loginResult.user).to.not.have.property('password');
    });

    it('debería fallar el login si la contraseña es incorrecta', async () => {
      await UserService.create(mockUser);

      try {
        await UserService.login(mockUser.email, 'passwordIncorrecto123');
        expect.fail('Debería haber fallado por contraseña incorrecta');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
      }
    });
  });

});