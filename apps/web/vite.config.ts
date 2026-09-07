import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// GitHub Pages serves the app from /KarNama/, and a dev server serves it from
// /. Vite's `base` has to match or every asset 404s in production while looking
// fine locally, which is the deploy failure that is invisible until it ships.
const base = process.env.KARNAMA_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
