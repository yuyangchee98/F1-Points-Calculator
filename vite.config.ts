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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-redux'],
          'dnd': ['react-dnd', 'react-dnd-html5-backend'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'redux': ['@reduxjs/toolkit']
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