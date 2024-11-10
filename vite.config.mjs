import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3002,
    hmr: true,
  },
  build: {
    minify: false, // Disable minification to keep variable names
    sourcemap: true,
  },
});
