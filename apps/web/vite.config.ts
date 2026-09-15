import react from '@vitejs/plugin-react-swc'
import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
// The ids alone, not the navigation's barrel, which carries React: the config runs
// in Node before anything is built, KN-505.
import { DESTINATION_IDS } from './src/shared/navigation/destinationIds'

// GitHub Pages serves the app from /KarNama/, and a dev server serves it from
// /. Vite's `base` has to match or every asset 404s in production while looking
// fine locally, which is the deploy failure that is invisible until it ships.
const base = process.env.KARNAMA_BASE ?? '/'

// GitHub Pages has no rewrites, but it serves a path from the .html file of that
// name with 200, and a path it has no file for from 404.html with 404: measured on
// the live site with /KarNama/404, where a directory answered 301 to a trailing
// slash. So the build copies the app's page to 404.html and to a page named for
// each destination, which /KarNama/network is served from, KN-505. Storybook's build takes this config too, and its preview's page is
// iframe.html, so a bundle with no index.html is left alone.
const aPageForEachDestination = (): Plugin => ({
  name: 'karnama-pages',
  apply: 'build',
  async writeBundle(options, bundle) {
    if (!('index.html' in bundle) || options.dir === undefined) return
    const index = join(options.dir, 'index.html')
    await copyFile(index, join(options.dir, '404.html'))
    for (const id of DESTINATION_IDS) await copyFile(index, join(options.dir, `${id}.html`))
  },
})

export default defineConfig({
  base,
  plugins: [react(), aPageForEachDestination()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
