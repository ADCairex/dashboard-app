# Etapa 1: Build (Vite)
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias (incluye devDependencies para hacer el build)
RUN npm ci

# Copiar el código fuente
COPY . .

# Build de la aplicación (Vite genera /dist)
RUN npm run build

# Etapa 2: Producción (Express + estáticos de Vite)
FROM node:18-alpine AS production

WORKDIR /app

# curl para healthchecks
RUN apk add --no-cache curl

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el build y el servidor desde la etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server

# Config genérica (sin credenciales)
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Arrancar servidor Express (que debe escuchar en PORT y tener /health)
CMD ["node", "src/server/api.js"]
