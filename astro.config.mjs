import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

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
