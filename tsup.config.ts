import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  outExtension: ({ format }) =>
    format === 'esm' ? { js: '.mjs' } : { js: '.js' }
})
