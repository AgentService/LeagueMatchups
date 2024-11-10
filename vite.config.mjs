import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    hmr: true,
  },
  build: {
    sourcemap: true,
  },
});
