# ✅ PASOS FINALES PARA EJECUTAR EL PROYECTO

## 📋 Estado Actual
- ✅ Código migrado de Base44 a API local
- ✅ Estructura de archivos reorganizada (App.jsx + index.jsx)
- ✅ Tailwind CSS configurado correctamente
- ✅ Servidor Express integrado en Vite
- ⚠️  PostgreSQL necesita iniciarse

## 🚀 Ejecutar el Proyecto

### Paso 1: Iniciar PostgreSQL

**Opción A - Con Docker (Recomendado)**:
1. Abre Docker Desktop
2. Espera a que esté completamente iniciado
3. Ejecuta:
```bash
docker-compose up -d
```

**Opción B - PostgreSQL Local**:
1. Asegúrate de que PostgreSQL esté corriendo
2. Edita `.env` y cambia el puerto:
```env
DB_PORT=5432  # en lugar de 5433
```

### Paso 2: Crear la base de datos y tablas

```bash
# Con Docker (puerto 5433):
psql -U postgres -h localhost -p 5433 -d dashboard_chatbot -f src/server/database/schema.sql

# Con PostgreSQL local (puerto 5432):
psql -U postgres -h localhost -p 5432 -d dashboard_chatbot -f src/server/database/schema.sql
```

Si la base de datos no existe, créala primero:
```bash
# Con Docker:
psql -U postgres -h localhost -p 5433 -c "CREATE DATABASE dashboard_chatbot;"

# Con PostgreSQL local:
psql -U postgres -c "CREATE DATABASE dashboard_chatbot;"
```

### Paso 3: Iniciar la aplicación

```bash
npm run dev
```

### Paso 4: Abrir en el navegador

http://localhost:5173

## ✅ Verificaciones

Deberías ver en la consola:
- `✅ Conexión exitosa a PostgreSQL`
- `✅ Rutas API configuradas en /api/*`
- `VITE v5.x.x ready in XXX ms`

En el navegador:
- Dashboard con sidebar de "Pedidos" y "Productos"
- Datos de ejemplo cargados desde PostgreSQL

## 🐛 Si hay errores

### Error: ECONNREFUSED PostgreSQL
- Docker Desktop no está corriendo → Inícialo
- PostgreSQL local no está corriendo → `sudo service postgresql start` (Linux) o verifica en Services (Windows)

### Error: database "dashboard_chatbot" does not exist
```bash
psql -U postgres -h localhost -p 5433 -c "CREATE DATABASE dashboard_chatbot;"
```

### Error: relation "products" does not exist
```bash
psql -U postgres -h localhost -p 5433 -d dashboard_chatbot -f src/server/database/schema.sql
```

## 📝 Archivos Clave Modificados

1. **src/App.jsx** - Configuración de rutas (nuevo)
2. **src/index.jsx** - Punto de entrada (nuevo)
3. **src/server/api.js** - API REST con PostgreSQL
4. **vite.config.js** - Integración de Express en Vite
5. **tailwind.config.js** - Configuración de Tailwind con variables CSS
6. **package.json** - Dependencias actualizadas

## 🎉 ¡Listo!

Una vez que PostgreSQL esté corriendo y las tablas creadas, la aplicación funcionará completamente en local sin dependencias de Base44.
