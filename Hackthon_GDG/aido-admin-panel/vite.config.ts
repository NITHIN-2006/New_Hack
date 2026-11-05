import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    strictPort: true, // Always runs on port 9000
    host: true,
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
});
