import vue from '@vitejs/plugin-vue';
import ViteImagemin from 'vite-plugin-imagemin';
import { defineConfig } from 'vite';

// vite.config.js
export default defineConfig({
  server: {
    port: 3002,
  },
  build: {
    sourcemap: true, // Disable source maps in production
    rollupOptions: {
      // Your rollup options here
    }
  },
  plugins: [
    vue(),
    ViteImagemin({
      mozjpeg: {
        quality: 75,
      },
      pngquant: {
        quality: [0.65, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [{ removeViewBox: false }],
      },
    }),
  ],
});
