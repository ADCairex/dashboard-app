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
        
        // Importar y configurar las rutas API
        const { setupApiRoutes } = await import('./src/server/api.js');
        setupApiRoutes(app);
        
        // Usar el middleware de express antes de Vite
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
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
