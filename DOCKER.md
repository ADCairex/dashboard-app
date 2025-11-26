# Docker Compose - PostgreSQL

Este proyecto incluye un `docker-compose.yml` para ejecutar PostgreSQL fácilmente.

## 🐳 Servicios incluidos

- **PostgreSQL 15** - Base de datos principal (puerto 5432)
- **Adminer** - Interfaz web para administrar PostgreSQL (puerto 8080)

## 🚀 Comandos

### Iniciar los contenedores

```bash
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f postgres
```

### Detener los contenedores

```bash
docker-compose down
```

### Detener y eliminar datos

```bash
docker-compose down -v
```

### Ver estado

```bash
docker-compose ps
```

## 🔗 Acceso

- **PostgreSQL**: `localhost:5432`
  - Usuario: `postgres`
  - Password: `postgres`
  - Base de datos: `docu_flow`

- **Adminer** (opcional): http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: docu_flow

## 📝 Notas

Los datos de PostgreSQL se guardan en un volumen Docker llamado `postgres_data`, por lo que persisten aunque detengas los contenedores.

Si no necesitas Adminer, puedes comentar o eliminar esa sección del `docker-compose.yml`.
