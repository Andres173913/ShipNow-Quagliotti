import { Router } from 'express';

import MockController from '../controller/mocks.controller.js';

const router = Router();

// Endpoints que devuelven datos simulados sin guardarlos en la base
router.get('/mocking-users', MockController.getMockUsers);
router.get('/mocking-products', MockController.getMockProducts);
router.get('/mocking-orders', MockController.getMockOrders);

// Endpoint que inserta registros de prueba en MongoDB de forma controlada
router.post('/generate-data', MockController.generateAndSaveData);

export default router;