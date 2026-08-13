import swaggerJSDoc from "swagger-jsdoc";
import { config } from "./config.js";

import { schemas } from "../docs/components/schemas.js";
import { responses } from "../docs/components/responses.js";
import {parameters} from "../docs/components/parameters.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description: "Documentación de la API ShipNow para gestión de usuarios, pedidos, entregas y más.",
    },
    servers: [
      {
        url: `http://localhost:${config.PORT ?? 3000}/`,
        description: "Servidor Local",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Endpoints para verificar el estado de la aplicación"
      },
      {
        name: "Logger",
        description: "Endpoints para generar logs de diferentes niveles"
      },
      {
        name: "Users",
        description: "Endpoints para la gestión de usuarios"  
    },
    {
        name: "Orders",
        description: "Endpoints para la gestión de pedidos"
      },
      {
        name: "Products",
        description: "Endpoints para la gestión de productos"
      },
      {
        name: "Mocks",
        description: "Endpoints para generar datos de prueba"
      },
      {
        name: "Carts",
        description: "Endpoints para la gestión de carritos de compra"
      }
    ],
    components: {
      schemas,
      responses,
      parameters,
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token"
        }
      }
    },
  },
  apis: ["./src/docs/**/*.yaml"]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);