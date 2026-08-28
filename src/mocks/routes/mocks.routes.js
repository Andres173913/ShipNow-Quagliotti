import { Router } from 'express';
import MockController from '../controller/mocks.controller.js';

const router = Router();

router.get('/mocking-users', MockController.getMockUsers);
router.get('/mocking-products', MockController.getMockProducts);
router.get('/mocking-orders', MockController.getMockOrders);
router.post('/generate-data', MockController.generateAndSaveData);

export default router;