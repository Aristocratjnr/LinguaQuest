import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const backendUrl = isDev ? 'http://localhost:8000' : 'https://linguaquest.onrender.com';
  
  return {
    plugins: [react()],
    define: {
      __BACKEND_URL__: JSON.stringify(backendUrl),
    },
    server: {
      port: 3000,
      proxy: isDev ? {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/scenario': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/translate': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/evaluate': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/dialogue': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/score': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/leaderboard': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/sentiment': {
          target: backendUrl,
          changeOrigin: true,
        },
      } : {}
    }
  };
});