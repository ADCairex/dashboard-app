
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
    console.error('❌ Error connecting to PostgreSQL:', err);
  } else {
    console.log('✅ Connected to PostgreSQL');
    console.log(`📂 Schema: ${schema}`);
  }
});

// API routes setup
export function setupApiRoutes(app) {
  app.use(cors());
  app.use(express.json());

  // ========== LOGIN ========== 
  app.post('/api/login', async (req, res) => {
    // You can change this to use environment variables if you prefer
    const USER = process.env.ADMIN_USER || 'admin';
    const PASS = process.env.ADMIN_PASSWORD || 'admin123';
    const { username, password } = req.body;
    if (username === USER && password === PASS) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }
  });

  // ========== HEALTH CHECK ========== 
  // Simple healthcheck route (for Docker)
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

  // ========== PRODUCTS ========== 
  app.get('/api/products', async (req, res) => {
    try {
      const { order_id } = req.query;

      // If order_id is provided, get products from order_products table with JOIN
      if (order_id) {
        const result = await pool.query(
          `SELECT op.id, op.order_id, op.product_id, op.amount, op.unit_price, op.line_total,
                  p.id, p.text, p.metadata
           FROM ${schema}.order_products op
           LEFT JOIN ${schema}.products p ON op.product_id = p.id
           WHERE op.order_id = $1`,
          [order_id]
        );
        res.json(result.rows);
      } else {
        // Otherwise, get all products
        const result = await pool.query(
          `SELECT id, text, metadata FROM ${schema}.products`
        );
        res.json(result.rows);
      }
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Error getting products' });
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
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ error: 'Error getting product' });
    }
  });

  app.post('/api/products', async (req, res) => {
    // Endpoint deshabilitado - Los productos son de solo lectura
    res.status(403).json({ error: 'Creating products is disabled' });
  });

  app.put('/api/products/:id', async (req, res) => {
    // Endpoint deshabilitado - Los productos son de solo lectura
    res.status(403).json({ error: 'Updating products is disabled' });
  });

  app.delete('/api/products/:id', async (req, res) => {
    // Endpoint deshabilitado - Los productos son de solo lectura
    res.status(403).json({ error: 'Deleting products is disabled' });
  });

  // ========== ORDERS ========== 
  app.get('/api/orders', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, phone, collected, black_list, date, total_price, collection_place, observations 
         FROM ${schema}.orders 
         ORDER BY date DESC`
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ error: 'Error getting orders' });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // Get order
      const orderResult = await pool.query(
        `SELECT id, name, phone, collected, black_list, date, total_price, collection_place, observations 
         FROM ${schema}.orders 
         WHERE id = $1`,
        [id]
      );
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      // Get order products
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
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Error getting order' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { name, phone, collected, black_list, date, collection_place, observations, items } = req.body;
      // Get next available ID
      const maxIdResult = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ${schema}.orders`
      );
      const orderId = maxIdResult.rows[0].next_id;
      // Calculate order total
      const total_price = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.amount)), 0);
      // Check if phone is in blacklist history
      const blacklistCheck = await client.query(
        `SELECT 1 FROM ${schema}.orders WHERE phone = $1 AND black_list = true LIMIT 1`,
        [phone]
      );
      const isBlacklisted = blacklistCheck.rows.length > 0;
      const finalBlackListStatus = isBlacklisted || black_list || false;

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO ${schema}.orders (id, name, phone, collected, black_list, date, total_price, collection_place, observations)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, phone, collected, black_list, date, total_price, collection_place, observations`,
        [orderId, name, phone, collected || false, finalBlackListStatus, date || new Date(), total_price, collection_place, observations]
      );
      // Insert order products
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const line_total = parseFloat(item.unit_price) * parseInt(item.amount);
          // Get next ID for order_products
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
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error creating order' });
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
      // If no items, it's a partial update (just status)
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
          return res.status(404).json({ error: 'Order not found' });
        }

        // Sync blacklist status to other orders with same phone
        const updatedOrder = orderResult.rows[0];
        if (updatedOrder.phone) {
          await client.query(
            `UPDATE ${schema}.orders SET black_list = $1 WHERE phone = $2 AND id != $3`,
            [updatedOrder.black_list, updatedOrder.phone, updatedOrder.id]
          );
        }

        await client.query('COMMIT');
        return res.json(updatedOrder);
      }
      // Full update with items
      const total_price = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.amount)), 0);
      // Update order
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
        return res.status(404).json({ error: 'Order not found' });
      }
      // Delete old order products
      await client.query(
        `DELETE FROM ${schema}.order_products WHERE order_id = $1`,
        [id]
      );
      // Insert new order products
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const line_total = parseFloat(item.unit_price) * parseInt(item.amount);
          // Get next ID for order_products
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
      // Sync blacklist status to other orders with same phone
      const updatedOrder = orderResult.rows[0];
      if (updatedOrder.phone) {
        await client.query(
          `UPDATE ${schema}.orders SET black_list = $1 WHERE phone = $2 AND id != $3`,
          [updatedOrder.black_list, updatedOrder.phone, updatedOrder.id]
        );
      }

      await client.query('COMMIT');
      res.json(updatedOrder);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Error updating order' });
    } finally {
      client.release();
    }
  });

  app.delete('/api/orders/:id', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { id } = req.params;
      // Delete order products first
      await client.query(
        `DELETE FROM ${schema}.order_products WHERE order_id = $1`,
        [id]
      );
      // Delete order
      const result = await client.query(
        `DELETE FROM ${schema}.orders WHERE id = $1 RETURNING id`,
        [id]
      );
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Order not found' });
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Error deleting order' });
    } finally {
      client.release();
    }
  });

  // ========== METRICS ========== 
  app.get('/api/metrics', async (req, res) => {
    try {
      // Total sold per product
      const salesByProduct = await pool.query(
        `SELECT p.id, p.text, SUM(op.amount) as total_units, SUM(op.line_total) as total_sold
         FROM ${schema}.order_products op
         LEFT JOIN ${schema}.products p ON op.product_id = p.id
         GROUP BY p.id, p.text
         ORDER BY total_sold DESC`
      );

      // Best selling product (by units)
      const bestSeller = salesByProduct.rows.length > 0 ? salesByProduct.rows[0] : null;

      res.json({
        products: salesByProduct.rows,
        bestSeller
      });
    } catch (error) {
      console.error('Error getting metrics:', error);
      res.status(500).json({ error: 'Error getting metrics' });
    }
  });

  // --------- END API ROUTES ---------
  console.log('✅ API routes configured at /api/*');
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
