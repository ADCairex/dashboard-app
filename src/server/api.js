
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'dashboard_chatbot',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});
const schema = process.env.DB_SCHEMA || 'public';

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log(`📂 Schema configurado: ${schema}`);
  }
});

// Configurar rutas API
export function setupApiRoutes(app) {
  app.use(cors());
  app.use(express.json());


  // ==================== HEALTH CHECK ====================
  // Ruta de healthcheck simple (sin /api) para Docker
  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ 
        status: 'ok', 
        database: 'connected',
        schema: schema,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'error', 
        database: 'disconnected',
        error: error.message 
      });
    }
  });


  // ==================== PRODUCTOS ====================
  app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, text, metadata FROM ${schema}.products`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT id, text, metadata FROM ${schema}.products WHERE id = $1`, 
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const { text, metadata } = req.body;
      const { randomUUID } = await import('crypto');
      const id = randomUUID();
      const result = await pool.query(
        `INSERT INTO ${schema}.products (id, text, metadata)
         VALUES ($1, $2, $3)
         RETURNING id, text, metadata`,
        [id, text, JSON.stringify(metadata)]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { text, metadata } = req.body;
      const result = await pool.query(
        `UPDATE ${schema}.products 
         SET text = $1, metadata = $2
         WHERE id = $3
         RETURNING id, text, metadata`,
        [text, JSON.stringify(metadata), id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM ${schema}.products WHERE id = $1 RETURNING id`, 
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  });

  // ==================== PEDIDOS ====================
  app.get('/api/orders', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, phone, collected, black_list, date, total_price, collection_place, observations 
         FROM ${schema}.orders 
         ORDER BY date DESC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // Obtener el pedido
      const orderResult = await pool.query(
        `SELECT id, name, phone, collected, black_list, date, total_price, collection_place, observations 
         FROM ${schema}.orders 
         WHERE id = $1`, 
        [id]
      );
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      // Obtener los productos del pedido
      const productsResult = await pool.query(
        `SELECT op.id, op.order_id, op.product_id, op.amount, op.unit_price, op.line_total,
                p.text as product_text, p.metadata as product_metadata
         FROM ${schema}.order_products op
         LEFT JOIN ${schema}.products p ON op.product_id = p.id
         WHERE op.order_id = $1`,
        [id]
      );
      const order = orderResult.rows[0];
      order.items = productsResult.rows;
      res.json(order);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { name, phone, collected, black_list, date, collection_place, observations, items } = req.body;
      // Obtener el siguiente ID disponible
      const maxIdResult = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ${schema}.orders`
      );
      const orderId = maxIdResult.rows[0].next_id;
      // Calcular el total del pedido
      const total_price = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.amount)), 0);
      // Insertar el pedido
      const orderResult = await client.query(
        `INSERT INTO ${schema}.orders (id, name, phone, collected, black_list, date, total_price, collection_place, observations)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, phone, collected, black_list, date, total_price, collection_place, observations`,
        [orderId, name, phone, collected || false, black_list || false, date || new Date(), total_price, collection_place, observations]
      );
      // Insertar los productos del pedido
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const line_total = parseFloat(item.unit_price) * parseInt(item.amount);
          // Obtener el siguiente ID para order_products
          const maxProductIdResult = await client.query(
            `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ${schema}.order_products`
          );
          const productId = maxProductIdResult.rows[0].next_id;
          await client.query(
            `INSERT INTO ${schema}.order_products (id, order_id, product_id, amount, unit_price, line_total)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [productId, orderId, item.product_id, item.amount, item.unit_price, line_total]
          );
        }
      }
      await client.query('COMMIT');
      res.status(201).json(orderResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear pedido:', error);
      res.status(500).json({ error: 'Error al crear pedido' });
    } finally {
      client.release();
    }
  });

  app.put('/api/orders/:id', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { id } = req.params;
      const { name, phone, collected, black_list, date, collection_place, observations, items } = req.body;
      // Si no hay items, es una actualización parcial (solo estado)
      if (!items) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (name !== undefined) {
          fields.push(`name = $${paramCount++}`);
          values.push(name);
        }
        if (phone !== undefined) {
          fields.push(`phone = $${paramCount++}`);
          values.push(phone);
        }
        if (collected !== undefined) {
          fields.push(`collected = $${paramCount++}`);
          values.push(collected);
        }
        if (black_list !== undefined) {
          fields.push(`black_list = $${paramCount++}`);
          values.push(black_list);
        }
        if (date !== undefined) {
          fields.push(`date = $${paramCount++}`);
          values.push(date);
        }
        if (collection_place !== undefined) {
          fields.push(`collection_place = $${paramCount++}`);
          values.push(collection_place);
        }
        if (observations !== undefined) {
          fields.push(`observations = $${paramCount++}`);
          values.push(observations);
        }
        if (fields.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'No fields to update' });
        }
        values.push(id);
        const orderResult = await client.query(
          `UPDATE ${schema}.orders 
           SET ${fields.join(', ')}
           WHERE id = $${paramCount}
           RETURNING id, name, phone, collected, black_list, date, total_price, collection_place, observations`,
          values
        );
        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        await client.query('COMMIT');
        return res.json(orderResult.rows[0]);
      }
      // Actualización completa con items
      const total_price = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.amount)), 0);
      // Actualizar el pedido
      const orderResult = await client.query(
        `UPDATE ${schema}.orders 
         SET name = $1, phone = $2, collected = $3, black_list = $4, date = $5, 
             total_price = $6, collection_place = $7, observations = $8
         WHERE id = $9
         RETURNING id, name, phone, collected, black_list, date, total_price, collection_place, observations`,
        [name, phone, collected, black_list, date, total_price, collection_place, observations, id]
      );
      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      // Eliminar los productos antiguos del pedido
      await client.query(
        `DELETE FROM ${schema}.order_products WHERE order_id = $1`,
        [id]
      );
      // Insertar los nuevos productos del pedido
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const line_total = parseFloat(item.unit_price) * parseInt(item.amount);
          // Obtener el siguiente ID para order_products
          const maxProductIdResult = await client.query(
            `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ${schema}.order_products`
          );
          const productId = maxProductIdResult.rows[0].next_id;
          await client.query(
            `INSERT INTO ${schema}.order_products (id, order_id, product_id, amount, unit_price, line_total)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [productId, id, item.product_id, item.amount, item.unit_price, line_total]
          );
        }
      }
      await client.query('COMMIT');
      res.json(orderResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar pedido:', error);
      res.status(500).json({ error: 'Error al actualizar pedido' });
    } finally {
      client.release();
    }
  });

  app.delete('/api/orders/:id', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { id } = req.params;
      // Eliminar los productos del pedido primero
      await client.query(
        `DELETE FROM ${schema}.order_products WHERE order_id = $1`,
        [id]
      );
      // Eliminar el pedido
      const result = await client.query(
        `DELETE FROM ${schema}.orders WHERE id = $1 RETURNING id`, 
        [id]
      );
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al eliminar pedido:', error);
      res.status(500).json({ error: 'Error al eliminar pedido' });
    } finally {
      client.release();
    }
  });

  // --------- FIN RUTAS API ---------
  console.log('✅ Rutas API configuradas en /api/*');
}

// Si se ejecuta como "node src/server/api.js", levantamos servidor propio
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = express();
  setupApiRoutes(app);
  // Servir estáticos del frontend (dist)
  const distPath = path.join(__dirname, '..', '..', 'dist');
  app.use(express.static(distPath));
  // Cualquier ruta que no sea /api ni /health, que sirva index.html (React Router)
  app.get('*', (req, res) => {
    // No sobrescribir /api ni /health
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
