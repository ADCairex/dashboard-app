# 🚀 Inicio Rápido - Dashboard Chatbot

## ✅ Pasos para ejecutar el proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar PostgreSQL

**Opción A: Con Docker (recomendado)**
```bash
# Iniciar Docker Desktop primero, luego:
docker-compose up -d
```

**Opción B: PostgreSQL local**
- Asegúrate de tener PostgreSQL instalado y corriendo
- Crea la base de datos:
```bash
psql -U postgres
CREATE DATABASE dashboard_chatbot;
\q
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales:

```env
# Para Docker (puerto 5433)
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=dashboard_chatbot
DB_PASSWORD=postgres
DB_PORT=5433

# Para PostgreSQL local (puerto 5432)
# DB_PORT=5432
```

### 4. Crear las tablas en la base de datos

```bash
# Si usas Docker (puerto 5433):
psql -U postgres -h localhost -p 5433 -d dashboard_chatbot -f src/server/database/schema.sql

# Si usas PostgreSQL local (puerto 5432):
psql -U postgres -d dashboard_chatbot -f src/server/database/schema.sql
```

### 5. Iniciar el proyecto
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

El servidor Vite integra automáticamente las rutas API de Express.

## 🔧 Estructura del proyecto

- **Frontend**: React + Vite (puerto 5173)
- **Backend**: Express integrado en Vite
- **Base de datos**: PostgreSQL (puerto 5433 Docker o 5432 local)

## 📝 Verificar que funciona

1. Abre http://localhost:5173 en tu navegador
2. Deberías ver el dashboard con las páginas de Pedidos y Productos
3. Los datos de ejemplo deberían cargarse desde PostgreSQL
4. En la consola deberías ver: `✅ Conexión exitosa a PostgreSQL`

## 🐛 Solución de problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión a PostgreSQL
```bash
# Verificar que Docker está corriendo
docker ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# O verificar PostgreSQL local
psql -U postgres -c "SELECT version();"
```

### Error 404 en /api/*
- Asegúrate de que las rutas API estén configuradas en `vite.config.js`
- Revisa la consola del navegador y del servidor

### Base de datos vacía
Ejecuta el script SQL para crear las tablas y datos de ejemplo:
```bash
psql -U postgres -h localhost -p 5433 -d dashboard_chatbot -f src/server/database/schema.sql
```

