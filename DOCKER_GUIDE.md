# 🐳 Docker - Dashboard Chatbot

## Comandos Rápidos

### Construir y ejecutar la aplicación

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Ver logs solo de postgres
docker-compose logs -f postgres
```

### Gestión de servicios

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra datos de BD)
docker-compose down -v

# Reiniciar servicios
docker-compose restart

# Reiniciar solo la app
docker-compose restart app
```

### Construcción de imagen

```bash
# Construir solo la imagen de la app
docker-compose build app

# Construir sin caché
docker-compose build --no-cache app

# Ver imágenes creadas
docker images | grep dashboard-chatbot
```

### Acceso a contenedores

```bash
# Acceder al contenedor de la app
docker exec -it dashboard-chatbot-app sh

# Acceder al contenedor de postgres
docker exec -it dashboard-chatbot-postgres psql -U postgres -d dashboard_chatbot
```

## Servicios

### 📦 App (dashboard-chatbot-app)
- **Puerto**: 3000
- **Imagen**: dashboard-chatbot-app:latest
- **Health Check**: http://localhost:3000/health

### 🗄️ PostgreSQL (dashboard-chatbot-postgres)
- **Puerto**: 5433 (host) → 5432 (contenedor)
- **Imagen**: pgvector/pgvector:pg16
- **Usuario**: postgres
- **Password**: postgres
- **Base de datos**: dashboard_chatbot
- **Schema**: juanfran_asencio

## Variables de Entorno

### App
- `NODE_ENV`: production
- `DB_HOST`: postgres
- `DB_PORT`: 5432
- `DB_DATABASE`: dashboard_chatbot
- `DB_USER`: postgres
- `DB_PASSWORD`: postgres
- `DB_SCHEMA`: juanfran_asencio

## Arquitectura

```
┌─────────────────────┐
│   Frontend (Vite)   │
│   Puerto: 3000      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Backend (Node)    │
│   Puerto: 3000      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL + PG    │
│   Vector (5433)     │
└─────────────────────┘
```

## Volúmenes

- `postgres_data`: Datos persistentes de PostgreSQL

## Red

- `dashboard-network`: Red bridge para comunicación entre servicios

## Health Checks

### App
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "database": "connected",
  "schema": "juanfran_asencio",
  "timestamp": "2025-11-25T10:00:00.000Z"
}
```

### PostgreSQL
```bash
docker exec dashboard-chatbot-postgres pg_isready -U postgres
```

## Troubleshooting

### La app no se conecta a la BD
1. Verificar que postgres esté saludable:
   ```bash
   docker-compose ps
   ```
2. Ver logs de postgres:
   ```bash
   docker-compose logs postgres
   ```

### Reiniciar desde cero
```bash
# Detener todo y eliminar volúmenes
docker-compose down -v

# Construir y levantar
docker-compose up -d --build

# Aplicar schema SQL
docker exec -i dashboard-chatbot-postgres psql -U postgres -d dashboard_chatbot < src/server/database/juanfran_asencio.sql
```

### Ver estadísticas de recursos
```bash
docker stats dashboard-chatbot-app dashboard-chatbot-postgres
```
