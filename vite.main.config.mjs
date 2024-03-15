//vite.main.config.mjs

import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  mode: "production",
  build: {
    outDir: path.resolve(__dirname, "./dist"), // Ensure this points to the correct output directory
    emptyOutDir: true, // Caution: This option will remove all files in the outDir when the build starts
    rollupOptions: {
      input: path.resolve(__dirname, "src/main/index.js"), // Adjust if your entry file is located elsewhere
      output: {
        format: "cjs",
        entryFileNames: "main.js",
        dir: path.resolve(__dirname, "dist"),
      },
    },
    rollupOptions: {
      external: ["node-fetch"],
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  resolve: {
    alias: {
      // other aliases
    },
  },
});
