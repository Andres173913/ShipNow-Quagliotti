import express from "express";
import cookieParser from "cookie-parser";

import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";

import usersRoutes from "./routes/users.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import mocksRoutes from "./mocks/routes/mocks.routes.js";
import { notfoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware para parsear el body de las solicitudes como JSON
app.use(express.json());
// Middleware para parsear cookies
app.use(cookieParser());

// Ruta de prueba para verificar que el servidor está corriendo (DEBE IR ANTES de los notfoundHandler)
app.get('/health', (req, res) => {
  res.send(`ShipNow API v1 - corriendo en ${config.NODE_ENV}`);
});

// Rutas de la API
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use('/api/mocking', mocksRoutes);

// Middlewares de control de errores y rutas no encontradas (SIEMPRE AL FINAL)
app.use(notfoundHandler);
app.use(errorHandler);

// Conexión a la base de datos e inicio del servidor
connectDB();

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});