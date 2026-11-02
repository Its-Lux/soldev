import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@/app': path.resolve(import.meta.dirname, './src/app'),
      '@/features': path.resolve(import.meta.dirname, './src/features'),
      '@/shared': path.resolve(import.meta.dirname, './src/shared'),
      '@/test': path.resolve(import.meta.dirname, './src/test'),
    },
  },
})
