# Imagen base liviana de Node.js en Alpine Linux
FROM node:22-alpine

# Definir directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install --omit=dev

# Copiar el resto del código de la aplicación
COPY src/ ./src

# Exponer el puerto predeterminado de la aplicación
EXPOSE 3000

# Definir la variable de entorno predeterminada
ENV NODE_ENV=production

# Comando de inicio del servidor
CMD ["npm", "run", "start"]
