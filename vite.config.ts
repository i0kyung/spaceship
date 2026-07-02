import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/spaceship/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
