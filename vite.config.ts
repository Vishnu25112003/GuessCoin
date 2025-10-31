import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['web3'],
          'firebase-vendor': ['firebase/app', 'firebase/database'],
          'ui-vendor': ['sweetalert2', 'toastr'],
        },
      },
    },
  },
})
