import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ViteImagemin from 'vite-plugin-imagemin';

export default defineConfig(({ mode }) => ({
  mode: mode || 'DEVELOPMENT',
  plugins: [
    vue(),
    ViteImagemin({
      disable: mode === 'DEVELOPMENT', // Disable in development for faster builds
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.65, 0.9], speed: 4 },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
  ],
  build: {
    sourcemap: mode === 'DEVELOPMENT',
    minify: mode !== 'DEVELOPMENT',
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      }
    }
  },

}));
