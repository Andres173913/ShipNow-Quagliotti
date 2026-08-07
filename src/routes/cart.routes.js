import { Router } from 'express';
import CartController from '../controllers/cart.controller.js';
import {authenticateToken} from "../middlewares/auth.middleware.js";


const cartRoutes = Router();


cartRoutes.get('/', authenticateToken, CartController.getCart);
cartRoutes.post('/products', authenticateToken, CartController.addProduct);
cartRoutes.delete('/', authenticateToken, CartController.clearCart);

export default cartRoutes;