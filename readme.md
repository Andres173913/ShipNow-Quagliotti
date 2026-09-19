# 🚀 ShipNow API - Backend Node.js & Express 

ShipNow es una API RESTful profesional para la gestión de usuarios, catálogo de productos, carrito de compras y logística de despacho de pedidos. Diseñada bajo una **Arquitectura en Capas (Layered Architecture)** y principios **SOLID**, garantiza un desacoplamiento total entre la lógica de negocio, las solicitudes HTTP, los middlewares de seguridad, el manejo de errores centralizado y la persistencia en MongoDB.

---

## 📁 Estructura del Proyecto (Clean Architecture)

```text
ShipNow/
├── logs/                       # Archivos de logs rotativos de Winston (Ignorado en Git/Docker)
├── uploads/                    # Archivos y documentos subidos vía Multer (Ignorado en Git/Docker)
├── src/
│   ├── config/                 # Configuración de entorno, MongoDB, Multer, Swagger y Logger.
│   ├── constants/              # Constantes congeladas inmutables (Roles, Mensajes de Error, Estados).
│   ├── controllers/            # Manejo del protocolo HTTP (req, res, respuestas JSON).
│   ├── docs/                   # Especificaciones OpenAPI / Swagger YAML.
│   ├── errors/                 # Diccionario centralizado de errores y clase AppError.
│   ├── middlewares/            # Autenticación JWT, roles, logger, errores y restricción interna.
│   ├── mocks/                  # Controlador, rutas y servicio de Mocks/Seeding con Faker.
│   ├── models/                 # Esquemas puros de datos con Mongoose.
│   ├── repositories/           # Capa de acceso a datos paginada y filtrada.
│   ├── routes/                 # Enrutamiento semántico REST de la aplicación.
│   ├── services/               # Lógica de negocio y reglas de dominio.
│   ├── utils/                  # Utilidades genéricas (Bcrypt, JWT).
│   ├── app.js                  # Configuración e instanciación de la aplicación Express.
│   └── server.js               # Punto de entrada principal que arranca el servidor HTTP.
├── test/                       # Suite de 215 pruebas automatizadas (Mocha, Chai, Supertest).
├── Dockerfile                  # Construcción de la imagen contenerizada basada en Node 20 Alpine.
├── .dockerignore               # Archivos excluidos del contexto del contenedor Docker.
├── .env.example                # Plantilla de variables de entorno para Desarrollo.
├── .env.production.example     # Plantilla de variables de entorno para Producción.
└── package.json                # Dependencias y scripts del proyecto.
```

---

## 🛠️ Tecnologías Utilizadas

- **Runtime:** Node.js v20+
- **Framework Backend:** Express.js v5 (con Helmet & CORS)
- **Base de Datos & ODM:** MongoDB & Mongoose v8
- **Seguridad & Autenticación:** JWT (JSON Web Tokens) & Bcrypt
- **Carga de Archivos:** Multer (Límite 5MB, tipos restringidos image/pdf)
- **Mocks & Seeding:** @faker-js/faker v10
- **Logging Centralizado:** Winston & Winston Daily Rotate File
- **Documentación Interactiva:** Swagger UI Express & Swagger JSDoc (OpenAPI 3.0)
- **Contenerización:** Docker & Docker Compose
- **Testing:** Mocha, Chai & Supertest

---

## ⚙️ Variables de Entorno

La aplicación valida de forma síncrona en el arranque la presencia de las variables críticas (`PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`). Si alguna falta, la API se detiene inmediatamente emitiendo un mensaje descriptivo para evitar estados inconsistentes.

### Variables Soportadas:

| Variable | Descripción | Valor Ejemplo (Desarrollo) | Valor Ejemplo (Producción) |
| :--- | :--- | :--- | :--- |
| `PORT` | Puerto en el que escucha el servidor HTTP | `3000` | `3000` |
| `NODE_ENV` | Entorno de ejecución de la app | `development` | `production` |
| `MONGO_URI` | URI de conexión a la base de datos MongoDB | `mongodb://localhost:27017/shipnow` | `mongodb://mongo:27017/shipnow_prod` |
| `SALT_ROUNDS` | Rondas de hasheo para Bcrypt | `10` | `12` |
| `JWT_SECRET` | Clave secreta para firmar y verificar tokens JWT | `your_jwt_secret_key` | `super_secret_production_key_change_me!` |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens JWT | `4h` | `4h` |
| `LOG_LEVEL` | Nivel mínimo de logs de Winston | `debug` | `info` |
| `ENABLE_INTERNAL_ENDPOINTS` | Permite ejecutar mocks/logger test en producción (`true`/`false`) | `true` | `false` |
| `CLIENT_URL` | Origen permitido para políticas CORS | `http://localhost:3000` | `http://localhost:3000` |

---

## 🚀 Ejecución Local de la API

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Configurar entorno local (`.env`)
Copia la plantilla de desarrollo:
```bash
cp .env.example .env
```

### 3. Iniciar en modo desarrollo (Watch Mode)
```bash
npm run dev
```
*El servidor iniciará en `http://localhost:3000` escuchando cambios.*

---

## 🩺 Endpoint de Health Check

Permite monitorear el estado operativo y rendimiento de la API sin exponer credenciales ni datos sensibles:

```http
GET /health
```
**Respuesta JSON:**
```json
{
  "status": "UP",
  "service": "ShipNow API",
  "environment": "development",
  "uptime": 124.52,
  "timestamp": "2026-09-07T11:23:00.000Z"
}
```

---

## ⚡ Performance, Paginación y Filtros

Para evitar respuestas masivas que saturen la red o bloqueen el Event Loop, los endpoints de listados grandes soportan paginación, límites de resultados y filtros por query string:

- `GET /api/products?page=1&limit=10&category=Tech&search=Teclado&minPrice=100&maxPrice=500`
- `GET /api/users?page=1&limit=10&role=courier&search=juan`
- `GET /api/orders/courier/available?page=1&limit=10`

### Estructura de Respuesta Paginada:
```json
{
  "status": "success",
  "payload": [ ... ],
  "page": 1,
  "limit": 10,
  "totalDocs": 45,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## 📁 Carga de Archivos (Multer)

- **Límite de Tamaño:** Máximo `5MB` por archivo.
- **Tipos Permitidos:** Filtro estricto por Mimetype (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
- **Ubicación:** Guardados fuera del código fuente en la carpeta `/uploads/` organizada por subdirectorios (`documents/`, `products/`, `receipts/`).
- **Control de Errores:** Interceptado por `handleMulterError` devolviendo estados `400 Bad Request` en caso de exceso de tamaño o tipo de archivo no permitido.

---

## 🔒 Política sobre Endpoints Internos (Mocks & Logger Test)

- En **Desarrollo** (`NODE_ENV=development`): Los endpoints `/api/mocking` y `/api/logger-test` están completamente habilitados.
- En **Producción** (`NODE_ENV=production`): Por seguridad y estabilidad, el middleware `restrictInternalEndpoints` bloquea el acceso a `/api/mocking` y `/api/logger-test` devolviendo un estado `403 Forbidden`, a menos que se configure explícitamente `ENABLE_INTERNAL_ENDPOINTS=true`.

---

## 📄 Documentación Interactiva (Swagger / OpenAPI 3.0)

Documentación interactiva disponible en:
```text
http://localhost:3000/api/docs
```
Permite explorar esquemas, modelos de Mongoose y probar peticiones HTTP en vivo.

---

## 🐳 Contenerización con Docker

### Archivos de Contenerización:
- **`Dockerfile`:** Basado en `node:22-alpine`, instala dependencias con `npm install --omit=dev`, expone el puerto `3000` y ejecuta `npm run start`.
- **`.dockerignore`:** Excluye `node_modules`, `.env`, `.git`, `logs/`, `uploads/`, `coverage/`, `scratch/` y `test/`.

### 1. Construir la imagen Docker:
```bash
docker build -t shipnow-api .
```

### 2. Ejecutar el contenedor con archivo de entorno:
```bash
docker run -d -p 3000:3000 --env-file .env --name shipnow-container shipnow-api
```

### 3. Verificar el contenedor:
```bash
curl http://localhost:3000/health
```

---

## 🧪 Ejecución de Pruebas Automatizadas

```bash
npm test
```
- **Resultado:** **215 de 215 pruebas pasadas exitosamente (100% de éxito, 0 fallas)**.
- Cobertura: Configuración, MongoDB, Logger Winston, Swagger, Paginación, Filtros, Middlewares de Seguridad, Multer File Uploads, Mocks y Política de Producción.

---

## 🐳 Ejecución con Docker (Docker Compose)
Si preferís levantar todo el entorno de forma automática (API + MongoDB) sin dependencias locales, podés usar Docker Compose:

### Requisitos
- Docker instalado.

- Docker Compose instalado.

### Pasos:
Asegurarte de tener tu archivo .env configurado.

- Ejecutar el siguiente comando para construir la imagen y levantar los servicios:

```Bash
docker compose up --build
```
Esto pondrá en marcha:

La base de datos MongoDB con healthcheck activo.

La API de ShipNow conectada y escuchando en el puerto 3000.

Para detener los contenedores, presioná Ctrl + C o ejecutá en otra terminal:

```Bash
docker compose down
```

## ⚠️ Archivos que NO deben subirse al Repositorio Git

Asegurados mediante `.gitignore` y `.dockerignore`:
- `.env` y `.env.local` (Contienen credenciales y claves secretas).
- `node_modules/` (Dependencias instaladas).
- `uploads/` (Archivos y documentos subidos dinámicamente por los usuarios).
- `logs/` (Archivos de logs rotativos de producción).
- `coverage/` (Informes de cobertura de código).