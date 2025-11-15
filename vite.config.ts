import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://f1pointscalculator.yaaaang.com',
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date(),
      generateRobotsTxt: false,
      // Manually specify routes with .html extensions
      routes: [
        '/',
        '/2024.html',
        '/2023.html'
      ]
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
        '2023': resolve(__dirname, '2023.html')
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
          // Include react-dnd with React to ensure proper load order
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
})