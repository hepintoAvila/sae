import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

export default defineConfig(({ mode }) => {
 // CORREGIDO: usa '' para cargar todas las VITE_, o 'VITE_'
 const env = loadEnv(mode, process.cwd(), '');

 const apiTarget = env.VITE_API_URL || 'https://biblioteca.unicesar.edu.co';

 console.log('[Vite] Modo:', mode);
 console.log('[Vite] API Target:', apiTarget);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api2025': {
          target: apiTarget,
          changeOrigin: true,
          secure: true, // <- CAMBIA A TRUE para https real
          // Si el certificado es autofirmado, usa false, pero en unicesar es válido
          rewrite: (path) => path, // <- NO reemplaces, ya viene /api2025
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('[Proxy ERROR]', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[Proxy] →', req.method, req.url, '→', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('[Proxy] ←', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      __API_TOKEN__: JSON.stringify(env.VITE_API_TOKEN),
      __API_USERNAME__: JSON.stringify(env.VITE_API_USERNAME),
      __API_PASSWORD__: JSON.stringify(env.VITE_API_PASSWORD),
    },
  }
});