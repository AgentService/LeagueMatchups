//vite.renderer.config.mjs

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ViteImagemin from "vite-plugin-imagemin";

// https://vitejs.dev/config/
export default defineConfig({
  mode: "production", // This sets NODE_ENV to production
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
