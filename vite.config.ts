import { defineConfig } from 'vite';

// Use relative asset paths so the built site can be hosted from any subpath.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
