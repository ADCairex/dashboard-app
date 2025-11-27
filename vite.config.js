import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import express from 'express'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer: async (server) => {
        const app = express();
        app.use(express.json());

        const { setupApiRoutes } = await import('./src/server/api.js');
        setupApiRoutes(app);

        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            app(req, res);
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
