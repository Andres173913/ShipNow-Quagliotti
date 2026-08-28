import { expect } from 'chai';
import mongoose from 'mongoose';
import UserService from '../../src/services/users.service.js';
import UserModel from '../../src/models/user.model.js';
import MockService from '../../src/mocks/services/mock.service.js';
import { AppError } from '../../src/errors/index.js';

describe('UserService Integration Tests', () => {
  let mockUser;

  beforeEach(async () => {
    // Limpiar la colección de usuarios para mantener aislamiento entre pruebas
    await UserModel.deleteMany({});
    
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

    it('debería lanzar un error si faltan campos obligatorios en el create', async () => {
      try {
        await UserService.create({ first_name: 'SoloNombre' });
        expect.fail('Debería haber lanzado error por campos faltantes');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.message).to.include('El email y la contraseña son obligatorios');
      }
    });
  });

  describe('getByEmail()', () => {
    it('debería retornar un usuario buscando por email existente', async () => {
      await UserService.create(mockUser);

      const foundUser = await UserService.getByEmail(mockUser.email);
      expect(foundUser).to.not.be.null;
      expect(foundUser.email).to.equal(mockUser.email);
    });

    it('debería lanzar un error si el email no existe', async () => {
      try {
        await UserService.getByEmail('noexiste@example.com');
        expect.fail('Debería haber lanzado error de usuario no encontrado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
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

  describe('update()', () => {
    it('debería actualizar los datos de un usuario existente', async () => {
      const created = await UserService.create(mockUser);

      const updated = await UserService.update(created._id, { first_name: 'NombreActualizado' });
      expect(updated.first_name).to.equal('NombreActualizado');
    });

    it('debería lanzar error al intentar actualizar un usuario con ID inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      try {
        await UserService.update(nonExistentId, { first_name: 'Fail' });
        expect.fail('Debería haber lanzado error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
    });
  });

  describe('delete()', () => {
    it('debería eliminar un usuario existente', async () => {
      const created = await UserService.create(mockUser);

      const deleted = await UserService.delete(created._id);
      expect(deleted).to.have.property('_id');

      const found = await UserModel.findById(created._id);
      expect(found).to.be.null;
    });

    it('debería lanzar error al intentar eliminar un usuario con ID inexistente', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      try {
        await UserService.delete(nonExistentId);
        expect.fail('Debería haber lanzado error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
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

    it('debería fallar el login si el email no está registrado', async () => {
      try {
        await UserService.login('noexiste@example.com', 'Password123!');
        expect.fail('Debería haber fallado por email no registrado');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(404);
      }
    });
  });

  describe('uploadDocument()', () => {
    it('debería subir y asociar un documento al usuario exitosamente', async () => {
      const created = await UserService.create(mockUser);
      const mockFile = {
        originalname: 'dni.pdf',
        filename: 'generated-dni.pdf',
        path: '/uploads/generated-dni.pdf',
        mimetype: 'application/pdf',
        size: 2048
      };

      const updated = await UserService.uploadDocument(created._id, mockFile, 'dni');
      expect(updated.documents).to.be.an('array');
      expect(updated.documents.length).to.equal(1);
      expect(updated.documents[0].originalName).to.equal('dni.pdf');
    });

    it('debería fallar si no se adjunta archivo', async () => {
      const created = await UserService.create(mockUser);

      try {
        await UserService.uploadDocument(created._id, null, 'dni');
        expect.fail('Debería haber lanzado error por falta de archivo');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(400);
      }
    });

    it('debería fallar si el tipo de documento es inválido', async () => {
      const created = await UserService.create(mockUser);
      const mockFile = {
        originalname: 'doc.pdf',
        filename: 'gen.pdf',
        path: '/uploads/gen.pdf',
        mimetype: 'application/pdf',
        size: 1024
      };

      try {
        await UserService.uploadDocument(created._id, mockFile, 'tipo-invalido');
        expect.fail('Debería haber lanzado error por tipo de documento inválido');
      } catch (error) {
        expect(error).to.be.an.instanceOf(AppError);
        expect(error.status).to.equal(400);
      }
    });
  });
});