import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/scenario': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/translate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/evaluate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/dialogue': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/score': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/leaderboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sentiment': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
});