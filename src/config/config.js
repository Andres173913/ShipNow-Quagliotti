import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = ['PORT', 'NODE_ENV', 'MONGO_URI', 'JWT_SECRET'];

for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`❌ [CONFIG ERROR]: La variable de entorno requerida "${varName}" no está definida en el archivo .env o en el entorno.`);
    console.error(`❌ La aplicación se detendrá inmediatamente para evitar comportamientos inconsistentes en ejecución.`);
    process.exit(1);
  }
}

export const config = {
  PORT: parseInt(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS, 10) || 10,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '4h',
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  ENABLE_INTERNAL_ENDPOINTS: process.env.ENABLE_INTERNAL_ENDPOINTS || 'false',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};