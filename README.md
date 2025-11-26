# Dashboard Chatbot - Sistema de Gestión de Pedidos y Productos

Sistema completo de gestión de pedidos y productos con frontend React y backend Node.js + PostgreSQL.

## 🚀 Características

- ✅ Gestión de productos (CRUD completo)
- ✅ Gestión de pedidos con estados
- ✅ Interfaz moderna con React y Tailwind CSS
- ✅ Base de datos PostgreSQL
- ✅ API REST con Express
- ✅ Componentes UI reutilizables

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado y corriendo
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
cd dashboard-chatbot
npm install
```

**NOTA**: Si encuentras errores de dependencias, intenta:
```bash
npm install --legacy-peer-deps
```

### 2. Configurar PostgreSQL

Primero, crea la base de datos en PostgreSQL:

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE dashboard_db;

# Salir de psql
\q
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_DATABASE=dashboard_db

# Server Configuration
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANTE**: Reemplaza `tu_contraseña_aqui` con tu contraseña real de PostgreSQL.

### 4. Inicializar la base de datos

Ejecuta el script SQL para crear las tablas y datos de ejemplo:

```bash
# Opción 1: Desde la línea de comandos
psql -U postgres -d dashboard_db -f server/database/schema.sql

# Opción 2: Desde psql interactivo
psql -U postgres -d dashboard_db
\i server/database/schema.sql
```

Esto creará:
- Tabla `products` con 5 productos de ejemplo
- Tabla `orders` con 3 pedidos de ejemplo
- Índices para optimizar consultas

## 🎯 Uso

### Iniciar el proyecto completo

```bash
# Desarrollo (inicia backend y frontend simultáneamente)
npm run dev
```

Esto iniciará:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173 (o el puerto que asigne Vite)

### Comandos individuales

```bash
# Solo servidor backend
npm run server

# Solo cliente frontend
npm run client

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
dashboard-chatbot/
├── server/                    # Backend Node.js
│   ├── index.js              # Punto de entrada del servidor
│   ├── api.js                # Rutas y lógica de la API
│   └── database/
│       └── schema.sql        # Schema de PostgreSQL
├── src/                      # Frontend React
│   ├── api/
│   │   └── apiClient.js      # Cliente HTTP para la API
│   ├── Components/
│   │   ├── orders/           # Componentes de pedidos
│   │   └── products/         # Componentes de productos
│   ├── Pages/
│   │   ├── Orders.js         # Página de pedidos
│   │   └── Products.js       # Página de productos
│   └── Entities/             # Definiciones de entidades
├── Layout.js                 # Layout principal
├── package.json              # Dependencias del proyecto
└── .env                      # Variables de entorno (no incluir en git)
```

## 🔌 API Endpoints

### Productos

- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Pedidos

- `GET /api/orders` - Listar todos los pedidos
- `GET /api/orders/:id` - Obtener un pedido
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/:id` - Actualizar pedido
- `DELETE /api/orders/:id` - Eliminar pedido

### Parámetros de consulta

Ambos endpoints soportan el parámetro `orderBy`:

```bash
# Ordenar por fecha descendente (más reciente primero)
GET /api/products?orderBy=-created_date

# Ordenar por precio ascendente
GET /api/products?orderBy=precio
```

## 🗃️ Modelo de Datos

### Tabla Products

```sql
- id: VARCHAR (PK)
- titulo: VARCHAR
- descripcion: TEXT
- precio: DECIMAL
- imagen_url: TEXT
- categoria: VARCHAR
- created_date: TIMESTAMP
```

### Tabla Orders

```sql
- id: VARCHAR (PK)
- cliente_nombre: VARCHAR
- cliente_direccion: TEXT
- cliente_telefono: VARCHAR
- items: JSONB (array de productos)
- estado: VARCHAR (pendiente, en preparación, en reparto, completado, cancelado)
- total: DECIMAL
- created_date: TIMESTAMP
```

## 🛠️ Tecnologías Utilizadas

### Backend
- Express.js - Framework web
- PostgreSQL (pg) - Base de datos
- dotenv - Gestión de variables de entorno
- cors - Cross-Origin Resource Sharing

### Frontend
- React 18
- TanStack Query (React Query) - Gestión de estado del servidor
- Tailwind CSS - Estilos
- Lucide React - Iconos
- date-fns - Manejo de fechas

## 🐛 Resolución de Problemas

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql  # Linux
brew services list                 # macOS
# Windows: Verificar en Servicios

# Verificar conexión
psql -U postgres -d dashboard_db
```

### El puerto 3000 ya está en uso

Cambia el puerto en `.env`:
```env
PORT=3001
```

### Error "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas Importantes

1. **Seguridad**: Este es un proyecto de desarrollo. Para producción:
   - Usa variables de entorno seguras
   - Implementa autenticación y autorización
   - Valida todas las entradas del usuario
   - Usa consultas parametrizadas (ya implementadas)

2. **Base de datos**: El archivo `.env` contiene credenciales sensibles. NUNCA lo subas a git.

3. **Datos de ejemplo**: El schema.sql incluye datos de ejemplo. Puedes eliminarlos si lo prefieres.

## 🤝 Contribuir

Este es un proyecto personal, pero si encuentras errores o mejoras, siéntete libre de crear un issue.

## 📄 Licencia

MIT

---

Hecho con ❤️ para gestionar pedidos y productos
