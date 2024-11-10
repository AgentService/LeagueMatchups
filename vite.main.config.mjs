import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

export default defineConfig(({ mode }) => ({
  plugins: [
    electron({
      entry: 'src/main.js', // Main process entry
    }),
  ],
  mode: mode || 'DEVELOPMENT',
  build: {
    minify: false, // Disable minification to keep variable names
    sourcemap: true,  // Enables source maps for debugging
    rollupOptions: {
      input: 'src/main.js',
      output: {
        format: 'cjs',
        entryFileNames: 'main.js',
      },
    },
  },
}));
