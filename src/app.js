import express from "express";
import cookieParser from "cookie-parser";

import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";
import logger from "./config/logger.js";
import { addLogger } from "./middlewares/logger.middleware.js"; // <-- 1. Importar el middleware del logger

import usersRoutes from "./routes/users.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import loggerRouter from "./routes/logger.routes.js";
import mocksRoutes from "./mocks/routes/mocks.routes.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware para parsear el body de las solicitudes como JSON
app.use(express.json());
// Middleware para parsear cookies
app.use(cookieParser());

// Inyectar el logger en todas las peticiones
app.use(addLogger);

// Ruta de prueba para verificar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.send(`ShipNow API v1 - corriendo en ${config.NODE_ENV}`);
});

app.use('/api/logger-test', loggerRouter); // Ruta de prueba para verificar que el logger está funcionando

// Rutas de la API
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/mocking', mocksRoutes);

// Middlewares de control de errores y rutas no encontradas (SIEMPRE AL FINAL)
app.use(notFoundHandler);
app.use(errorHandler);

// Conexión a la base de datos e inicio del servidor
connectDB();

app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
});