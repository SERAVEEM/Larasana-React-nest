import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.mp4'],
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Split vendor chunks for better caching and parallel loading
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router') || id.includes('node_modules/react-helmet-async')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/lenis')) {
            return 'vendor-utils'
          }
        },
      },
    },
  },
})
