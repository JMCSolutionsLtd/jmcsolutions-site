import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward portal API calls to the Express server in development
      '/api/portal': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})