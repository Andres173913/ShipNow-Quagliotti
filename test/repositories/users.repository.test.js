import { expect } from 'chai';
import UserRepository from '../../src/repositories/users.repository.js';
import UserModel from '../../src/models/user.model.js';
import MockService from '../../src/mocks/services/mock.service.js';

describe('UserRepository Integration Tests', () => {
  let mockUserData;

  beforeEach(async () => {
    await UserModel.deleteMany({});
    const [userData] = MockService.generateMockUsers(1);
    mockUserData = userData;
  });

  describe('create()', () => {
    it('debería crear un usuario en la base de datos', async () => {
      const createdUser = await UserRepository.create(mockUserData);

      expect(createdUser).to.have.property('_id');
      expect(createdUser.email).to.equal(mockUserData.email);
    });
  });

  describe('find() y findById()', () => {
    it('debería retornar todos los usuarios', async () => {
      await UserRepository.create(mockUserData);
      const users = await UserRepository.find();

      expect(users).to.be.an('array').that.is.not.empty;
      expect(users.length).to.equal(1);
    });

    it('debería encontrar un usuario por su ID', async () => {
      const newUser = await UserRepository.create(mockUserData);
      const foundUser = await UserRepository.findById(newUser._id);

      expect(foundUser).to.not.be.null;
      expect(foundUser._id.toString()).to.equal(newUser._id.toString());
    });
  });

  describe('findByEmail()', () => {
    it('debería encontrar un usuario por su email', async () => {
      await UserRepository.create(mockUserData);
      const foundUser = await UserRepository.findByEmail(mockUserData.email);

      expect(foundUser).to.not.be.null;
      expect(foundUser.email).to.equal(mockUserData.email);
    });
  });

  describe('update()', () => {
    it('debería actualizar los datos de un usuario', async () => {
      const newUser = await UserRepository.create(mockUserData);
      const updatedUser = await UserRepository.update(newUser._id, { first_name: 'NombreActualizado' });

      expect(updatedUser.first_name).to.equal('NombreActualizado');
    });
  });

  describe('delete()', () => {
    it('debería eliminar un usuario por su ID', async () => {
      const newUser = await UserRepository.create(mockUserData);
      await UserRepository.delete(newUser._id);
      
      const foundUser = await UserRepository.findById(newUser._id);
      expect(foundUser).to.be.null;
    });
  });

});