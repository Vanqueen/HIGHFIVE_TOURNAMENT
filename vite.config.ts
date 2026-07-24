import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // 🔴 METS ICI LE PORT BACKEND
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
