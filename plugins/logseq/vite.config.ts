import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '',  // This ensures paths are relative
  build: {
    target: 'esnext',
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['iife'],
      name: 'CerebruhMCPPlugin',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@logseq/libs'],
      output: {
        globals: {
          '@logseq/libs': 'logseq'
        },
        inlineDynamicImports: true,
        entryFileNames: '[name].js'
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});