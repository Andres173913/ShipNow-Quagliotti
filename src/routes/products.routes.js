import express from 'express';

import ProductController from '../controllers/products.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/roles.js';

const productsRoutes = express.Router();

// --- RUTAS PÚBLICAS ---
// Cualquier usuario (esté logueado o no, clientes, repartidores) puede ver el catálogo
//Query para traer todos los productos
productsRoutes.get('/', ProductController.getAll);
// Query para traer segun id
productsRoutes.get('/:id', ProductController.getById);

// --- RUTAS PROTEGIDAS Y RESTRINGIDAS ---
// Solo los administradores de la empresa pueden gestionar el inventario de la base de datos
// Query para crear un producto
productsRoutes.post('/', authenticateToken, authorizeRoles(USER_ROLES.ADMIN), ProductController.create);
// Query para actualizar segun id
productsRoutes.patch('/:id', authenticateToken, authorizeRoles(USER_ROLES.ADMIN), ProductController.update);
// Query para eliminar segun id
productsRoutes.delete('/:id', authenticateToken, authorizeRoles(USER_ROLES.ADMIN), ProductController.delete);

export default productsRoutes;