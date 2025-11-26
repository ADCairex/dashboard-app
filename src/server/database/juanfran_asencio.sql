-- Crear schema para la empresa
CREATE SCHEMA IF NOT EXISTS juanfran_asencio;

-- Crear tabla products dentro del schema
CREATE TABLE juanfran_asencio.products (
  id UUID PRIMARY KEY,
  text TEXT,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- Crear tabla order_products dentro del schema
CREATE TABLE juanfran_asencio.order_products (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id UUID,
  amount INTEGER NOT NULL,
  unit_price NUMERIC(10,2),
  line_total NUMERIC(10,2)
);

-- Crear tabla orders dentro del schema
CREATE TABLE juanfran_asencio.orders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  collected BOOLEAN,
  black_list BOOLEAN,
  date TIMESTAMP WITH TIME ZONE,
  total_price NUMERIC(10,2),
  collection_place TEXT,
  observations TEXT
);
