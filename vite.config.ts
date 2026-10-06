import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets work both at / and at GitHub Pages /<repository>/.
export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  base: './',
  build: { outDir: '../dist', emptyOutDir: true },
  server: { host: '0.0.0.0' },
});
