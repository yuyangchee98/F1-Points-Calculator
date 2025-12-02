import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import sitemap from 'vite-plugin-sitemap'

// Generate race URLs from API
async function generateRaceUrls(): Promise<string[]> {
  const baseUrls = [
    '/',
    '/2024.html',
    '/2023.html',
    '/2022.html',
    '/about.html'
  ];

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
        races.forEach((race: { id: string }) => {
          baseUrls.push(`/race/${year}/${race.id}`);
        });
      } else {
        console.error(`Failed to fetch ${year}: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Failed to fetch race schedules for sitemap:', error);
  }

  console.log(`Total URLs generated: ${baseUrls.length}`);
  return baseUrls;
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://f1pointscalculator.yaaaang.com',
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date(),
      generateRobotsTxt: false,
      dynamicRoutes: await generateRaceUrls()
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Enable minification and tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '2024': resolve(__dirname, '2024.html'),
        '2023': resolve(__dirname, '2023.html'),
        '2022': resolve(__dirname, '2022.html'),
        'about': resolve(__dirname, 'about.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Don't manually chunk chart.js - let it be lazy loaded
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return undefined;
          }
          // Lazy load react-dnd separately to reduce initial bundle
          if (id.includes('react-dnd') || id.includes('dnd-core')) {
            return 'dnd';
          }
          if (id.includes('react')) {
            return 'react-vendor';
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('redux')) {
            return 'redux';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}))