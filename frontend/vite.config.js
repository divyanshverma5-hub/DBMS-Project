import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In Docker Compose, the frontend container reaches the API using the backend
// service name. Locally, the default remains localhost:5000.
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
