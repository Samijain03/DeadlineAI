import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-redesign',
    rollupOptions: { input: fileURLToPath(new URL('./redesign.html', import.meta.url)) },
  },
});
