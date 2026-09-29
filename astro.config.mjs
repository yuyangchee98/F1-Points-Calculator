import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Driver pages below the index threshold are built (so links never 404) but
// carry noindex, and a sitemap must not list pages it asks engines to drop.
// The Worker's index says which ones; if it is unreachable the page build fails
// anyway (fetchDriverIndex), so an empty set here never ships.
const { PUBLIC_API_BASE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const apiBase = process.env.PUBLIC_API_BASE_URL ?? PUBLIC_API_BASE_URL;
let noindexPaths = new Set();
try {
  const res = await fetch(`${apiBase}/api/drivers`);
  const { drivers = [] } = await res.json();
  noindexPaths = new Set(drivers.filter((d) => !d.indexed).map((d) => `/drivers/${d.slug}`));
} catch {
  /* dev without a Worker: nothing to filter */
}

export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  // Emit flat files (about.html) rather than directory-style (about/index.html).
  // Cloudflare Pages auto-appends a slash to directory URLs, which 308-redirects
  // every no-slash URL in our sitemap/canonicals. Flat files serve those URLs
  // directly with a 200, keeping the whole site consistent with trailingSlash:'never'.
  build: { format: 'file' },
  site: 'https://f1pointscalculator.chyuang.com',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) => !noindexPaths.has(new URL(page).pathname.replace(/\/$/, '')),
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date(),
    }),
  ],
  vite: {
    build: {
      chunkSizeWarningLimit: 500,
    },
    server: {
      proxy: {
        '/user': {
          target: 'http://localhost:52313',
          changeOrigin: true,
        },
        '/leaderboard': {
          target: 'http://localhost:52313',
          changeOrigin: true,
        },
        // Blog is SSR'd by the worker (covers /blog, /blog/:slug, /blog/widgets.js)
        '/blog': {
          target: 'http://localhost:52313',
          changeOrigin: true,
        },
        '/sitemap-blog.xml': {
          target: 'http://localhost:52313',
          changeOrigin: true,
        },
      },
    },
  },
});
