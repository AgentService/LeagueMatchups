// vite.main.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  mode: "production",
  build: {
    // Target specific formats for Electron
    rollupOptions: {
      input: "src/main.js",
      output: {
        format: "cjs", // CommonJS format suitable for Electron's main process+
        entryFileNames: "main.js",
      },
    },
  },
});
