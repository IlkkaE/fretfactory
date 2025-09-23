import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Export a factory to access env via Vite's loadEnv; default base is '/'
export default defineConfig(() => {
  // At config time, import.meta.env is available in Vite; fallback to '/'
  const base = (import.meta as any).env?.VITE_BASE || '/'
  return {
    plugins: [react()],
    base,
    server: { open: true },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: { react: ['react', 'react-dom'] },
        },
      },
    },
  }
})