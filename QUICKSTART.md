# Guía Rápida de Inicio

## Pasos para ejecutar el proyecto

### 1. Instalar dependencias
```bash
npm install
```

Si hay problemas con las dependencias:
```bash
npm install --legacy-peer-deps
```

### 2. Configurar PostgreSQL

#### Crear la base de datos:
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE dashboard_db;

# Salir
\q
```

#### Configurar credenciales:
Edita el archivo `.env` y actualiza:
```env
DB_PASSWORD=tu_contraseña_de_postgres
```

### 3. Inicializar la base de datos

Opción A - Ejecutar schema SQL:
```bash
psql -U postgres -d dashboard_db -f server/database/schema.sql
```

Opción B - Usar el script de Node.js:
```bash
npm run db:setup
```

### 4. Iniciar la aplicación

```bash
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

### 5. Verificar que funciona

Abre tu navegador en http://localhost:5173

Deberías ver:
- Página de Pedidos con datos de ejemplo
- Página de Productos con datos de ejemplo

## Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Asegúrate de que la base de datos `dashboard_db` existe

### Error: "Port 3000 already in use"
Cambia el puerto en `.env`:
```env
PORT=3001
```

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error 404 en las peticiones API
- Asegúrate de que el servidor backend está corriendo (puerto 3000)
- Verifica que `vite.config.js` tiene configurado el proxy
- Reinicia ambos servidores

## Estructura de Comandos

```bash
npm run dev          # Inicia backend + frontend
npm run server       # Solo backend (puerto 3000)
npm run client       # Solo frontend (puerto 5173)
npm run build        # Build para producción
npm run db:setup     # Crear tablas de BD
```

## Verificación Rápida

### Backend funcionando:
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{"status":"OK","message":"Servidor funcionando correctamente"}
```

### API funcionando:
```bash
curl http://localhost:3000/api/products
```

Debería devolver un array de productos.

## Siguientes Pasos

1. ✅ Verificar que puedes ver la lista de productos
2. ✅ Crear un nuevo producto
3. ✅ Ver la lista de pedidos
4. ✅ Crear un nuevo pedido

¡Listo para empezar a desarrollar! 🚀
