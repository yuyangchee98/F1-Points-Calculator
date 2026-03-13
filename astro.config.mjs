import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Generate race URLs from API for sitemap
async function generateRaceUrls() {
  const raceUrls = [];
  const years = [2022, 2023, 2024];
  const API_BASE = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

  try {
    for (const year of years) {
      console.log(`Fetching schedule for ${year}...`);
      const response = await fetch(`${API_BASE}/api/init?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        const races = data.schedule || [];
        console.log(`Found ${races.length} races for ${year}`);
        races.forEach((race) => {
          raceUrls.push(`/race/${year}/${race.id}`);
        });
      } else {
        console.error(`Failed to fetch ${year}: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Failed to fetch race schedules for sitemap:', error);
  }

  console.log(`Total race URLs generated: ${raceUrls.length}`);
  return raceUrls;
}

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
      customPages: await generateRaceUrls().then(urls =>
        urls.map(u => `https://f1pointscalculator.chyuang.com${u}`)
      ),
    }),
  ],
  vite: {
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return undefined;
            }
            if (id.includes('react-dnd') || id.includes('dnd-core')) {
              return 'dnd';
            }
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('redux')) {
              return 'redux';
            }
          },
        },
      },
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
        '/race': {
          target: 'http://localhost:52313',
          changeOrigin: true,
        },
      },
    },
  },
});
