import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
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
      },
    },
  },
});
