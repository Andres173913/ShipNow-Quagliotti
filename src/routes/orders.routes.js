import express from 'express';

import OrderController from '../controllers/orders.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/roles.js';

const ordersRoutes = express.Router();

// Todos estos endpoints requieren estar logueado como COURIER o ADMINISTRADOR

// Endpoint para obtener pedidos disponibles para Couriers
ordersRoutes.get(
  '/courier/available', 
  authenticateToken, 
  authorizeRoles(USER_ROLES.COURIER, USER_ROLES.ADMIN), 
  OrderController.getAvailable
);

// Endpoint para que un Courier acepte un pedido
ordersRoutes.patch(
  '/:id/accept', 
  authenticateToken, 
  authorizeRoles(USER_ROLES.COURIER, USER_ROLES.ADMIN), 
  OrderController.accept
);

// Endpoint para que un Courier marque un pedido como entregado
ordersRoutes.patch(
  '/:id/deliver', 
  authenticateToken, 
  authorizeRoles(USER_ROLES.COURIER, USER_ROLES.ADMIN), 
  OrderController.deliver
);

export default ordersRoutes;