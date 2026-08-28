# 🚀 ShipNow API - Backend Node.js & Express

ShipNow es una API RESTful profesional para la gestión de usuarios, catálogo de productos y logística de despacho de pedidos. Diseñada bajo una **Arquitectura en Capas (Layered Architecture)**, garantiza un desacoplamiento total entre la lógica de negocio, las solicitudes HTTP y el motor de base de datos.

---

## 📁 Estructura del Proyecto (Clean Architecture)

El proyecto se organiza en capas fundamentales dentro de `src/`, donde cada componente cumple con una única responsabilidad (SOLID):

```text
├── logs/           # Archivos de logs rotativos de Winston.
├── uploads/        # Archivos y documentos subidos al servidor vía Multer.
├── src/
│   ├── config/         # Inicialización de variables de entorno, MongoDB, Multer, Swagger y Logger.
│   ├── constants/      # Valores fijos congelados (Roles, Mensajes de Error, Estados de Órdenes).
│   ├── controllers/    # Manejo del protocolo HTTP (Extracción de req, res y códigos de estado).
│   ├── errors/         # Gestión centralizada de errores y clase AppError.
│   ├── middlewares/    # Capa de seguridad (Autenticación JWT, Autorización por Roles, Logger).
│   ├── mocks/          # Módulo de Mocks y Seeding (Controlador, Servicio y Rutas con Faker).
│   ├── models/         # Definición de esquemas de datos puros con Mongoose.
│   ├── repositories/   # Acceso y persistencia de datos (Aislamiento completo del ORM).
│   ├── routes/         # Enrutamiento semántico y definición de verbos REST.
│   ├── services/       # Lógica de negocio y reglas de dominio.
│   ├── utils/          # Herramientas genéricas reutilizables (Criptografía, JWT).
│   ├── app.js          # Configuración principal de la aplicación Express.
│   └── server.js       # Punto de entrada principal que inicia el servidor.
├── test/               # Suite de pruebas automatizadas (Mocha, Chai, Supertest).
├── .env                # Variables de entorno locales (Excluido de Git).
├── .env.test           # Variables de entorno para pruebas automatizadas.
└── package.json        # Dependencias y scripts del proyecto.
```

---

## 🛠️ Tecnologías Utilizadas

* **Runtime:** Node.js v20+
* **Framework Backend:** Express.js
* **Base de Datos (ODM):** MongoDB & Mongoose
* **Seguridad y Criptografía:** JWT (JSON Web Tokens) & Bcrypt
* **Carga de Archivos:** Multer
* **Mocks y Datos Simulados:** @faker-js/faker
* **Logging:** Winston & Winston Daily Rotate File
* **Documentación:** Swagger UI Express & Swagger JSDoc (OpenAPI 3.0)
* **Testing:** Mocha, Chai & Supertest
* **Entorno:** Dotenv

---

## ⚙️ Requisitos Previos e Instalación

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Andres173913/ShipNow-Quagliotti
cd ShipNow
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
npm run dev # O ejecuta: node --watch src/server.js
```

---

## 🧠 Flujo de la Lógica de Negocio
Para mantener el código mantenible y testeable, las peticiones siguen estrictamente este ciclo de vida:
`Cliente ──> Routes ──> Middlewares (JWT/Multer) ──> Controllers ──> SERVICES (Negocio) ──> Repositories ──> MongoDB`

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
| `POST` | `/api/users/:id/documents` | Autenticado | Sube y asocia un documento de usuario (`DNI`, `licencia`, etc.). |

### 📦 Módulo de Productos (Catálogo)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Público | Obtiene la lista completa de productos disponibles. |
| `GET` | `/api/products/:id` | Público | Obtiene los detalles de un producto específico. |
| `POST` | `/api/products` | `ADMIN` | Registra un nuevo producto en el catálogo. |
| `PATCH` | `/api/products/:id` | `ADMIN` | Modifica stock, precios o datos de un producto. |
| `DELETE` | `/api/products/:id` | `ADMIN` | Elimina un producto del catálogo. |
| `POST` | `/api/products/:id/image` | `ADMIN` | Sube y asocia la miniatura (`thumbnail`) de un producto. |

### 🛒 Módulo de Carrito de Compras

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Autenticado | Obtiene el carrito activo del usuario autenticado. |
| `POST` | `/api/cart/products` | Autenticado | Agrega o incrementa un producto en el carrito. |
| `DELETE` | `/api/cart` | Autenticado | Vacía el carrito del usuario. |

### 🚚 Módulo de Órdenes & Despacho (Flujo del Courier)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/courier/available` | `COURIER`, `ADMIN` | Lista todas las órdenes en espera de un repartidor (`status: READY`). |
| `PATCH` | `/api/orders/:id/accept` | `COURIER`, `ADMIN` | El Courier se asigna el pedido y cambia a `IN_TRANSIT`. |
| `PATCH` | `/api/orders/:id/deliver` | `COURIER`, `ADMIN` | El Courier marca el pedido en la puerta como `DELIVERED`. |
| `POST` | `/api/orders/:id/receipt` | `COURIER`, `ADMIN` | Sube y asocia el comprobante o recibo de entrega. |

---

## 🔒 Mecanismos de Seguridad Implementados

1. **Ocultación de Credenciales:** El esquema del usuario cuenta con `select: false` en el campo `password` para evitar filtraciones accidentales hacia el cliente.
2. **Validación en Arranque:** El archivo `config.js` verifica de forma síncrona que todas las variables de entorno críticas existan antes de encender el puerto, impidiendo estados zombie de la aplicación.
3. **Inmutabilidad de Constantes:** Los roles (`USER`, `ADMIN`, `COURIER`) y los mensajes de error del sistema están blindados con `Object.freeze()` para evitar alteraciones en tiempo de ejecución.
4. **Inyección de Contexto:** El middleware de autenticación decodifica el token e inyecta los datos del operador en `req.user`, permitiendo auditorías internas de seguridad en las capas inferiores.

---

## 📁 Módulo de Multer y Carga de Archivos (Subida de Documentos)

El proyecto cuenta con integración de **Multer** configurada en `src/config/multer.config.js` para la gestión, procesamiento y almacenamiento estructurado de archivos subidos al servidor en la carpeta `uploads/`.

### 🛠️ Características Principales de Multer:
* **Almacenamiento por Disco (`diskStorage`):** Genera nombres únicos concatenando marcas de tiempo e identificadores para evitar colisiones de archivos.
* **Organización:** Los archivos se procesan según su propósito (Documentos de Usuario, Imágen de Productos y Comprobantes de Pago/Entrega).
* **Persistencia de Metadatos:** Los metadatos de los archivos (`originalName`, `generatedName`, `path`, `mimetype`, `size`, `uploadedAt`) se guardan directamente dentro de los esquemas Mongoose en arreglos estructurados (`documents`, `thumbnails`, `receipts`).

### 📌 Endpoints de Subida de Archivos:
1. **Documentos de Usuario:** `POST /api/users/:id/documents` (Campo multipart `document`, tipos permitidos: `dni`, `license`, `certificate`, `other`).
2. **Miniaturas de Productos:** `POST /api/products/:id/image` (Campo multipart `thumbnail`).
3. **Comprobantes de Órdenes:** `POST /api/orders/:id/receipt` (Campo multipart `receipt`).

---

## # API ShipNow - Módulo de Mocks y Generación de Datos de Prueba

Este proyecto incluye un módulo de simulación (**Mocks**) utilizando la librería `@faker-js/faker` y controladores dedicados para facilitar el desarrollo, las pruebas y el poblamiento rápido (**Seeding**) de la base de datos en MongoDB.

---

### 🚀 Características Principales de Mocks:

* **Generación de Usuarios Mock:** Creación de perfiles de usuario simulados con roles dinámicos (incluyendo soporte para repartidores/couriers).
* **Generación de Productos Mock:** Creación automática de artículos con información comercial variada y miniaturas simuladas.
* **Generación de Órdenes Mock:** Simulación de pedidos vinculados a documentos reales existentes en la base de datos (usuarios y productos).
* **Inserción Masiva (Seeding):** Endpoint para poblar la base de datos de forma controlada mediante transacciones automáticas.
* **Validaciones de Seguridad:** Límites estrictos de cantidad (máximo 50 elementos por solicitud) para prevenir sobrecarga en el servidor.

---

### 📂 Estructura del Módulo de Mocks

* **Controlador (`MockController`):** Ubicado en `src/mocks/controller/mocks.controller.js`. Maneja las peticiones HTTP, validaciones de parámetros de entrada (`query` y `body`) y respuestas JSON estructuradas.
* **Rutas:** Ubicadas en `src/mocks/routes/mocks.routes.js`.
* **Servicio (`MockService`):** Ubicado en `src/mocks/services/mock.service.js`. Contiene la lógica de negocio y el uso de Faker para la estructuración de los datos.

---

### 🛠️ Endpoints Disponibles de Mocks

#### 1. Obtener Usuarios Simulados (Sin Guardar)
* **URL:** `GET /api/mocking/mocking-users?count=10`
* **Query Params Opcionales:** `count` (Número de usuarios a generar, por defecto `50`, máximo `50`).

#### 2. Obtener Productos Simulados (Sin Guardar)
* **URL:** `GET /api/mocking/mocking-products?count=10`
* **Query Params Opcionales:** `count` (Número de productos a generar, por defecto `20`).

#### 3. Obtener Órdenes Simuladas (Sin Guardar)
* **URL:** `GET /api/mocking/mocking-orders?count=5`
* **Query Params Opcionales:** `count` (Número de órdenes a generar, por defecto `10`).

#### 4. Inserción Masiva Controlada (Seed)
* **URL:** `POST /api/mocking/generate-data`
* **Body Parameters (JSON):**
  ```json
  {
    "usersCount": 10,
    "productsCount": 15,
    "ordersCount": 5
  }
  ```

---

## ⚠️ Manejo de Errores y Validaciones

El sistema cuenta con una gestión centralizada de excepciones para asegurar respuestas predecibles y claras ante fallos en las solicitudes, validando de forma estricta los tipos de datos en la creación y actualización de recursos.

### Características principales:
* **Bloques Try/Catch:** Captura asíncrona de errores en controladores y servicios.
* **Códigos de Estado HTTP:** Uso correcto de códigos estándar (`400` para peticiones mal formadas, `404` para recursos no hallados y `500` para errores imprevistos).
* **Validación de Tipos y Campos:** Control estricto sobre los payloads entrantes.
* **Respuestas JSON Estructuradas:** Formato unificado de error que facilita la lectura por parte del cliente.

---

## 🪵 Sistema de Logging de la Aplicación

Este proyecto utiliza **Winston** para la gestión centralizada de registros (logs), lo que permite un monitoreo eficiente tanto en desarrollo como en producción.

### ⚙️ Niveles de Log:
* `fatal (0)` - Fallas críticas que requieren atención inmediata.
* `error (1)` - Errores de ejecución o excepciones capturadas.
* `warn (2)` - Advertencias sobre estados inusuales.
* `info (3)` - Eventos operativos importantes.
* `http (4)` - Registro de peticiones HTTP.
* `debug (5)` - Información detallada para desarrollo.

### 📁 Almacenamiento de Registros:
Los logs se guardan automáticamente en la carpeta `logs/` con un sistema de rotación diaria (retención de 14 días):
* `fatal-%DATE%.log`
* `error-%DATE%.log`
* `combined-%DATE%.log`

---

## 📄 Documentación de la API (Swagger)

El proyecto cuenta con documentación interactiva generada con **Swagger** (`swagger-jsdoc` y `swagger-ui-express`), permitiendo visualizar y probar todos los endpoints directamente desde el navegador.

* **URL de Documentación:** `http://localhost:3000/api/docs`

---

## 🧪 Testing, Calidad de Código y Base de Datos de Pruebas

El proyecto incluye una suite de 210 tests unitarios y de integración desarrollada con **Mocha**, **Chai** y **Supertest**, diseñada para verificar el correcto funcionamiento de rutas, controladores, servicios, repositorios y middlewares.

### 🚀 ¿Cómo ejecutar las pruebas?
```bash
npm test
```
*Toda la suite de 210 pruebas se ejecuta sobre `.env.test` con 100% de tasa de éxito.*