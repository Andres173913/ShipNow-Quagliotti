import express from "express";

import UserController from "../controllers/users.controller.js";
import {authenticateToken, authorizeRoles} from "../middlewares/auth.middleware.js";
import {USER_ROLES} from "../constants/roles.js";
import uploader from "../config/multer.config.js";

const usersRoutes = express.Router();

// --- RUTAS PÚBLICAS ---
// Query para crear un usuario
usersRoutes.post('/', UserController.create);
// Query para login de usuario
usersRoutes.post('/login', UserController.login);

// --- RUTAS PROTEGIDAS Y RESTRINGIDAS ---
// Solo los usuarios autenticados pueden acceder a estas rutas

// Querys para traer segun usuarios
usersRoutes.get('/', authenticateToken, authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.COURIER), UserController.getAll);
// Query para traer segun email
usersRoutes.get('/search', authenticateToken, UserController.getByEmail);
// Query para traer segun id
usersRoutes.get('/:id', authenticateToken, UserController.getById);
// Query para actualizar segun id
usersRoutes.patch('/:id', authenticateToken, UserController.update);
// Query para eliminar segun id
usersRoutes.delete('/:id', authenticateToken, authorizeRoles(USER_ROLES.ADMIN), UserController.delete);

// --- RUTA PARA SUBIDA DE ARCHIVOS / DOCUMENTOS ---
// El middleware de multer procesa el archivo antes de llegar al controlador
usersRoutes.post('/:id/documents', authenticateToken, uploader.single('document'), UserController.uploadDocument);

export default usersRoutes;