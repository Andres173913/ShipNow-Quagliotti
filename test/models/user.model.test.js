import { expect } from 'chai';
import mongoose from 'mongoose';
import UserModel from '../../src/models/user.model.js';
import { USER_ROLES } from '../../src/constants/roles.js';
import MockService from '../../src/mocks/services/mock.service.js';

describe('User Model Validation Tests', () => {

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('Esquema y Campos Requeridos', () => {
    it('debería fallar si se intenta crear un usuario sin campos obligatorios', async () => {
      const userWithoutRequiredField = new UserModel({});
      
      let err;
      try {
        await userWithoutRequiredField.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
      expect(err.errors.first_name).to.exist;
      expect(err.errors.last_name).to.exist;
      expect(err.errors.email).to.exist;
      expect(err.errors.password).to.exist;
    });

    it('debería asignar el rol por defecto (USER) si no se especifica uno', async () => {
      const [mockUser] = MockService.generateMockUsers(1);

      const user = new UserModel({
        ...mockUser,
        role: undefined 
      });

      const savedUser = await user.save();
      expect(savedUser.role).to.equal(USER_ROLES.USER);
    });
  });

  describe('Restricciones y Opciones de Campos', () => {
    it('debería fallar si se intenta registrar un email duplicado (unique)', async () => {
      const [userOne, userTwo] = MockService.generateMockUsers(2);

      await UserModel.create(userOne);

      const duplicateUser = new UserModel({
        ...userTwo,
        email: userOne.email 
      });

      let err;
      try {
        await duplicateUser.save();
      } catch (error) {
        err = error;
      }

      expect(err).to.exist;
      expect(err.code).to.equal(11000);
    });

    it('no debería retornar la contraseña por defecto en las consultas debido a select: false', async () => {
      const [mockUser] = MockService.generateMockUsers(1);

      await UserModel.create(mockUser);

      const foundUser = await UserModel.findOne({ email: mockUser.email });

      expect(foundUser).to.not.be.null;
      expect(foundUser.password).to.be.undefined;
    });

    it('debería permitir agregar y validar metadatos de documentos en el esquema', async () => {
      const [mockUser] = MockService.generateMockUsers(1);
      mockUser.documents = [{
        originalName: 'dni.pdf',
        generatedName: 'gen-dni.pdf',
        path: '/uploads/gen-dni.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        documentType: 'dni'
      }];

      const savedUser = await UserModel.create(mockUser);

      expect(savedUser.documents).to.be.an('array');
      expect(savedUser.documents.length).to.equal(1);
      expect(savedUser.documents[0].originalName).to.equal('dni.pdf');
      expect(savedUser.documents[0].documentType).to.equal('dni');
    });
  });

});