import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  mode: mode || 'DEVELOPMENT',
  build: {
    rollupOptions: {
      input: 'src/preload.js',
      output: {
        format: 'cjs',
        entryFileNames: 'preload.js',
      },
    },
    sourcemap: mode === 'DEVELOPMENT',
    minify: mode !== 'DEVELOPMENT',
  },
}));
