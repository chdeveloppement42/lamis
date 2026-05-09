import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Shared types — resolves @immo/shared to the monorepo shared package
      '@immo/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
})
