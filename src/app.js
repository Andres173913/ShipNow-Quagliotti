import express from "express";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./config/config.js";
import logger from "./config/logger.js";
import { addLogger } from "./middlewares/logger.middleware.js"; // Importar el middleware del logger
import { swaggerSpec } from "./config/swagger.config.js"; // Importar la configuración de Swagger

import usersRoutes from "./routes/users.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import loggerRouter from "./routes/logger.routes.js";
import mocksRoutes from "./mocks/routes/mocks.routes.js";
import { restrictInternalEndpoints } from "./middlewares/internal.middleware.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet()); // Middleware de seguridad para proteger la aplicación de algunas vulnerabilidades web
 // Middleware para habilitar CORS y permitir solicitudes desde diferentes dominios
app.use(cors({
  origin: config.NODE_ENV === "production" ? config.CLIENT_URL : "*", // Permitir solicitudes desde el dominio de producción o desde cualquier origen en desarrollo
}));

// Middleware para parsear el body de las solicitudes como JSON
app.use(express.json());

// Middleware de Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Middleware para parsear cookies
app.use(cookieParser());

// Inyectar el logger en todas las peticiones
app.use(addLogger);

// Ruta de prueba para verificar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "ShipNow API",
    environment: config.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/logger-test', restrictInternalEndpoints, loggerRouter); // Ruta de prueba para verificar logger

// Rutas de la API
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/mocking', restrictInternalEndpoints, mocksRoutes);

// Middlewares de control de errores y rutas no encontradas (SIEMPRE AL FINAL)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;