//vite.preload.config

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config
export default defineConfig({
  mode: "production", // This sets NODE_ENV to production
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: "src/preload.js",
      output: {
        format: "cjs",
        entryFileNames: 'preload.js', // Ensure the file is named preload.js
      },
    },
  },
});
