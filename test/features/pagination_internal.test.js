import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import { config } from '../../src/config/config.js';
import ProductModel from '../../src/models/product.model.js';
import UserModel from '../../src/models/user.model.js';
import { generateToken } from '../../src/utils/jwt.utils.js';
import { USER_ROLES } from '../../src/constants/roles.js';

describe('Module 8 Features: Pagination, Filters & Internal Endpoints Policy', () => {
  let adminToken;
  let courierToken;

  beforeEach(async () => {
    await ProductModel.deleteMany({});
    await UserModel.deleteMany({});

    // Crear admin y courier
    const adminUser = await UserModel.create({
      first_name: 'Admin',
      last_name: 'Test',
      email: 'admin.pag@example.com',
      password: 'password123',
      role: USER_ROLES.ADMIN
    });

    const courierUser = await UserModel.create({
      first_name: 'Courier',
      last_name: 'Test',
      email: 'courier.pag@example.com',
      password: 'password123',
      role: USER_ROLES.COURIER
    });

    adminToken = generateToken({ id: adminUser._id.toString(), email: adminUser.email, role: adminUser.role });
    courierToken = generateToken({ id: courierUser._id.toString(), email: courierUser.email, role: courierUser.role });

    // Insertar productos de prueba
    await ProductModel.create([
      { title: 'Teclado Mecánico', description: 'Teclado gamer RGB', price: 150, stock: 10, category: 'Tech', code: 'PROD-001' },
      { title: 'Mouse Inalámbrico', description: 'Mouse ergonómico', price: 50, stock: 25, category: 'Tech', code: 'PROD-002' },
      { title: 'Monitor 4K', description: 'Monitor ultra HD 27"', price: 400, stock: 5, category: 'Tech', code: 'PROD-003' },
      { title: 'Silla Ergonómica', description: 'Silla para oficina', price: 200, stock: 8, category: 'Muebles', code: 'PROD-004' }
    ]);
  });

  describe('Paginación y Filtros de Productos (GET /api/products)', () => {
    it('debería retornar los resultados paginados con metadatos (page, limit, totalDocs, totalPages)', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=2');

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array');
      expect(res.body.payload.length).to.equal(2);
      expect(res.body.page).to.equal(1);
      expect(res.body.limit).to.equal(2);
      expect(res.body.totalDocs).to.equal(4);
      expect(res.body.totalPages).to.equal(2);
      expect(res.body.hasNextPage).to.be.true;
    });

    it('debería filtrar productos por categoría', async () => {
      const res = await request(app)
        .get('/api/products?category=Muebles');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array');
      expect(res.body.payload.length).to.equal(1);
      expect(res.body.payload[0].category).to.equal('Muebles');
    });

    it('debería buscar productos por palabra clave (search)', async () => {
      const res = await request(app)
        .get('/api/products?search=Teclado');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array');
      expect(res.body.payload.length).to.equal(1);
      expect(res.body.payload[0].title).to.include('Teclado');
    });
  });

  describe('Paginación de Usuarios (GET /api/users)', () => {
    it('debería retornar la lista de usuarios paginada para un rol autorizado', async () => {
      const res = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.be.an('array');
      expect(res.body.payload.length).to.equal(1);
      expect(res.body.page).to.equal(1);
      expect(res.body.limit).to.equal(1);
      expect(res.body.totalDocs).to.equal(2);
    });
  });

  describe('Restricción de Rutas Internas en Producción', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = config.NODE_ENV;
    });

    afterEach(() => {
      config.NODE_ENV = originalEnv;
    });

    it('debería denegar acceso con 403 a /api/mocking/mocking-users cuando NODE_ENV es production', async () => {
      config.NODE_ENV = 'production';
      config.ENABLE_INTERNAL_ENDPOINTS = 'false';

      const res = await request(app)
        .get('/api/mocking/mocking-users');

      expect(res.status).to.equal(403);
      expect(res.body.status).to.equal('error');
    });
  });
});
