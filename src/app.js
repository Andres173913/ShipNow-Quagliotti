import express from "express";
import cookieParser from "cookie-parser";

import {config} from "./config/config.js";
import {connectDB} from "./config/db.js";

import usersRoutes from "./routes/users.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";

const app = express();

//middleware para parsear el body de las solicitudes como JSON
app.use(express.json());
//middleware para parsear cookies
app.use(cookieParser());

//rutas de la API
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

//ruta de prueba para verificar que el servidor está corriendo
app.get('/health', (req, res) => {
  res.send(`ShipNow API v1 - corriendo en ${config.NODE_ENV}`);
});

//conexion a la base de datos
connectDB();

//iniciar el servidor
app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});