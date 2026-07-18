# 🚀 ShipNow API - Backend Node.js & Express

ShipNow es una API RESTful profesional para la gestión de usuarios, catálogo de productos y logística de despacho de pedidos. Diseñada bajo una **Arquitectura en Capas (Layered Architecture)**, garantiza un desacoplamiento total entre la lógica de negocio, las solicitudes HTTP y el motor de base de datos.

---

## 📁 Estructura del Proyecto (Clean Architecture)

El proyecto se organiza en 8 capas fundamentales, donde cada componente cumple con una única responsabilidad (SOLID):

```text
├── config/         # Inicialización de variables de entorno y conexión a MongoDB.
├── constants/      # Valores fijos congelados (Roles, Mensajes de Error).
├── controllers/    # Manejo del protocolo HTTP (Extracción de req, res y códigos de estado).
├── middlewares/    # Capa de seguridad (Autenticación JWT y Autorización por Roles).
├── models/         # Definición de esquemas de datos puros con Mongoose.
├── repositories/   # Acceso y persistencia de datos (Aislamiento completo del ORM).
├── routes/         # Enrutamiento semántico y definición de verbos REST.
├── utils/          # Herramientas genéricas reutilizables (Criptografía, JWT).
├── .env            # Variables de entorno locales (Excluido de Git).
└── app.js          # Punto de entrada principal de la aplicación.
```

---

## 🛠️ Tecnologías Utilizadas

*   **Runtime:** Node.js v20+
*   **Framework Backend:** Express.js
*   **Base de Datos (ODM):** MongoDB & Mongoose
*   **Seguridad y Criptografía:** JWT (JSON Web Tokens) & Bcrypt
*   **Entorno:** Dotenv

---

## ⚙️ Requisitos Previos e Instalación

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com
cd shipnow-api
npm install
```

### 2. Configurar variables de entorno (`.env`)
Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shipnow
SALT_ROUNDS=10
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=4h
```

### 3. Levantar el servidor en desarrollo
```bash
npm run dev # O ejecuta: node --watch app.js
```

---

## 🧠 Flujo de la Lógica de Negocio
Para mantener el código mantenible y testeable, las peticiones siguen estrictamente este ciclo de vida:
`Cliente ──> Routes ──> Middlewares (JWT) ──> Controllers ──> SERVICES (Negocio) ──> Repositories ──> MongoDB`

---

## 📌 Documentación de Endpoints (API Reference)

### 👥 Módulo de Usuarios & Autenticación

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Público | Registra un nuevo usuario (Cliente/Courier/Admin). |
| `POST` | `/api/users/login` | Público | Autentica al usuario y devuelve el Token JWT. |
| `GET` | `/api/users` | `ADMIN`, `COURIER` | Lista todos los usuarios registrados. |
| `GET` | `/api/users/search` | Autenticado | Busca un usuario específico mediante query params (`?email=`). |
| `GET` | `/api/users/:id` | Autenticado | Obtiene el perfil de un usuario por su ID. |
| `PATCH` | `/api/users/:id` | Autenticado | Actualiza parcialmente los datos de un usuario. |
| `DELETE` | `/api/users/:id` | `ADMIN` | Elimina permanentemente un usuario del sistema. |

### 📦 Módulo de Productos (Catálogo)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Público | Obtiene la lista completa de productos disponibles. |
| `GET` | `/api/products/:id` | Público | Obtiene los detalles de un producto específico. |
| `POST` | `/api/products` | `ADMIN` | Registra un nuevo producto en el catálogo. |
| `PATCH` | `/api/products/:id` | `ADMIN` | Modifica stock, precios o datos de un producto. |
| `DELETE` | `/api/products/:id` | `ADMIN` | Elimina un producto del catálogo. |

### 🚚 Módulo de Órdenes & Despacho (Flujo del Courier)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/api/orders/:id/ready` | `ADMIN` | Marca un pedido como preparado y listo para reparto (`status: READY`). |
| `GET` | `/api/orders/courier/available` | `COURIER`, `ADMIN` | Lista todas las órdenes en espera de un repartidor. |
| `PATCH` | `/api/orders/:id/accept` | `COURIER`, `ADMIN` | El Courier se asigna el pedido y cambia a `IN_TRANSIT`. |
| `PATCH` | `/api/orders/:id/deliver` | `COURIER`, `ADMIN` | El Courier marca el pedido en la puerta como `DELIVERED`. |

---

## 🔒 Mecanismos de Seguridad Implementados

1.  **Ocultación de Credenciales:** El esquema del usuario cuenta con `select: false` en el campo `password` para evitar filtraciones accidentales hacia el cliente.
2.  **Validación en Arranque:** El archivo `config.js` verifica de forma síncrona que todas las variables de entorno críticas existan antes de encender el puerto, impidiendo estados zombie de la aplicación.
3.  **Inmutabilidad de Constantes:** Los roles (`USER`, `ADMIN`, `COURIER`) y los mensajes de error del sistema están blindados con `Object.freeze()` para evitar alteraciones en tiempo de ejecución.
4.  **Inyección de Contexto:** El middleware de autenticación decodifica el token e inyecta los datos del operador en `req.user`, permitiendo auditorías internas de seguridad en las capas inferiores.
