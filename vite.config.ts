import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect GitHub Pages (project pages) and set base to `/<repo>/` automatically in CI.
// Priority: VITE_BASE env > GitHub Actions repo-based base > '/'
export default defineConfig(() => {
  // Access env via globalThis to avoid requiring @types/node for process
  const P = (globalThis as any).process as any | undefined
  const envBase = P?.env?.VITE_BASE as string | undefined
  const inCI = (P?.env?.GITHUB_ACTIONS as string | undefined) === 'true'
  const repo = (P?.env?.GITHUB_REPOSITORY as string | undefined)?.split('/')?.[1]
  const base = envBase ?? (inCI && repo ? `/${repo}/` : '/')
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