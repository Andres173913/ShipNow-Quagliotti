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
git clone https://github.com/Andres173913/ShipNow-Quagliotti
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

# API ShipNow - Módulo de Mocks y Generación de Datos de Prueba

Este proyecto incluye un módulo de simulación (**Mocks**) utilizando la librería `Faker` y controladores dedicados para facilitar el desarrollo, las pruebas y el poblamiento rápido (**Seeding**) de la base de datos en MongoDB.

---

## 🚀 Características Principales

* **Generación de Usuarios Mock:** Creación de perfiles de usuario simulados con roles dinámicos (incluyendo soporte para repartidores/couriers).
* **Generación de Productos Mock:** Creación automática de artículos con información comercial variada.
* **Generación de Órdenes Mock:** Simulación de pedidos vinculados a documentos reales existentes en la base de datos (usuarios y productos).
* **Inserción Masiva (Seeding):** Endpoint para poblar la base de datos de forma controlada mediante transacciones automáticas.
* **Validaciones de Seguridad:** Límites estrictos de cantidad (máximo 50 elementos por solicitud) para prevenir sobrecarga en el servidor.

---

## 📂 Estructura del Módulo

* **Controlador (`MockController`):** Ubicado en `src/mocks/controller/mocks.controller.js`. Maneja las peticiones HTTP, validaciones de parámetros de entrada (`query` y `body`) y respuestas JSON estructuradas.
* **Rutas:** Ubicadas en `src/mocks/routes/mocks.routes.js`.
* **Servicio (`MockService`):** Ubicado en `src/mocks/services/mock.service.js`. Contiene la lógica de negocio y el uso de Faker para la estructuración de los datos.

---

## 🛠️ Endpoints Disponibles

### 1. Obtener Usuarios Simulados (Sin Guardar)
* **URL:** `GET /api/mocking/mocking-users?count=10`
* **Query Params Opcionales:** 
  * `count` (Número de usuarios a generar, por defecto `50`, máximo `50`).
* **Respuesta:** JSON con la lista de usuarios generados en el `payload`.

### 2. Obtener Productos Simulados (Sin Guardar)
* **URL:** `GET /api/mocking/mocking-produtcs?count=10`
* **Query Params Opcionales:**
  * `count` (Número de productos a generar, por defecto `20`).

### 3. Obtener Órdenes Simuladas (Sin Guardar)
* **URL:** `GET /api/mocks/mocking-orders?count=5`
* **Query Params Opcionales:**
  * `count` (Número de órdenes a generar, por defecto `10`).
* **Nota:** Requiere que existan usuarios y productos previos en la base de datos para extraer sus IDs reales.

### 4. Inserción Masiva Controlada (Seed)
* **URL:** `POST /api/mocks/generate-data`
* **Body Parameters (JSON):**
  ```json
  {
    "usersCount": 10,
    "productsCount": 15,
    "ordersCount": 5
  }

## ⚠️ Manejo de Errores y Validaciones

El sistema cuenta con una gestión centralizada de excepciones para asegurar respuestas predecibles y claras ante fallos en las solicitudes, validando de forma estricta los tipos de datos en la creación y actualización de recursos (por ejemplo, asegurando tipos correctos para campos clave como `"price"`, `"stock"` o `"category"`).

### Características principales:
* **Bloques Try/Catch:** Captura asíncrona de errores en controladores y servicios.
* **Códigos de Estado HTTP:** Uso correcto de códigos estándar (`400` para peticiones mal formadas, `404` para recursos no hallados y `500` para errores imprevistos).
* **Validación de Tipos y Campos:** Control estricto sobre los payloads entrantes (ej: validando que `price` y `stock` sean numéricos válidos y que `category` pertenezca a los valores permitidos).
* **Respuestas JSON Estructuradas:** Formato unificado de error que facilita la lectura por parte del cliente.

**Ejemplo de payload de entrada validado:**
  ```json
  {
    "price": "8000",
    "stock": "10",
    "category": "ropa"
  }

  ```

## Sistema de Logging de la Aplicación
Este proyecto utiliza Winston para la gestión centralizada de registros (logs), lo que permite un monitoreo eficiente tanto en desarrollo como en producción.

### 🪵 Configuración del Sistema
El sistema está configurado con niveles de prioridad personalizados para categorizar los eventos de la aplicación:

### ⚙️ Niveles de Log
El orden de severidad (de mayor a menor prioridad) es:

fatal (0) - Fallas críticas que requieren atención inmediata.

error (1) - Errores de ejecución o excepciones capturadas.

warn (2) - Advertencias sobre estados inusuales.

info (3) - Eventos operativos importantes.

http (4) - Registro de peticiones HTTP.

debug (5) - Información detallada para desarrollo.

### 📁 Almacenamiento de Registros
Los logs se guardan automáticamente en la carpeta logs/ con un sistema de rotación diaria (con retención de 14 días) para facilitar la gestión de archivos:

fatal-%DATE%.log: Captura exclusivamente errores críticos (nivel fatal).

error-%DATE%.log: Captura errores de la aplicación (nivel error).

combined-%DATE%.log: Archivo central que registra toda la actividad de la aplicación de forma centralizada.

Nota: En el entorno de desarrollo, los logs también se imprimen directamente en la consola con formato colorizado para facilitar la lectura en tiempo real.

### 💻 Ejemplo de Uso en el Código
El logger se encuentra centralizado y puede importarse en cualquier capa de la aplicación (servicios, controladores, middlewares):

JavaScript
import logger from '../utils/logger.js';

// Registro de eventos operativos
logger.info(`Usuario creado exitosamente con ID: ${newUser._id}`);

// Registro al capturar una excepción
logger.error(`Error al conectar con la base de datos: ${error.message}`);

// Registro de eventos críticos
logger.fatal('Falla crítica en el sistema de infraestructura');