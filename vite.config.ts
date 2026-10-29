import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration volontairement minimale : le projet est 100 % statique,
// déployable tel quel sur Vercel, Netlify ou un simple serveur de fichiers.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/@react-three/')) return 'r3f'
          if (id.includes('node_modules/postprocessing')) return 'postprocessing'
        },
      },
    },
  },
})
