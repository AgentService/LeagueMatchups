import vue from '@vitejs/plugin-vue';
import ViteImagemin from 'vite-plugin-imagemin';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

// vite.config.js
export default defineConfig({
  mode: process.env.NODE_ENV || 'development', // Ensure mode is set correctly
  server: {
    port: 3002,
    hmr: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Your rollup options here
    }
  },
  plugins: [
    vue(),
    electron({
      entry: 'src/main.js', // Path to your Electron main process entry
    }),
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
