import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // When deploying to a custom domain (root of the domain) the base
  // path should be '/' so asset URLs are generated correctly.
  // Previously this repo used '/fretfactory/' which works for
  // github.io/<repo>/ but breaks when the site is served at the
  // root (e.g. https://www.fretfactory.fi).
  base: '/',
  server: { open: true },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
})