# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el build y archivos necesarios desde la etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server

# Exponer el puerto de la aplicación
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_DATABASE=dashboard_chatbot
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_SCHEMA=public

# Comando para iniciar la aplicación
CMD ["node", "src/server/api.js"]
