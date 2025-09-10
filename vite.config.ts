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
      dynamicRoutes: ['/'],
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date().toISOString().split('T')[0]
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
          if (id.includes('react') && !id.includes('react-chartjs') && !id.includes('react-dnd')) {
            return 'react-vendor';
          }
          if (id.includes('react-dnd')) {
            return 'dnd';
          }
          if (id.includes('@reduxjs/toolkit')) {
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