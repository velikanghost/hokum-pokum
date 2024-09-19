import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// @ts-ignore
import stdLibBrowser from 'vite-plugin-node-stdlib-browser'

export default defineConfig({
  plugins: [
    react(),
    stdLibBrowser(), // Use rollup polyfills for Node.js built-ins
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer', // Polyfill Buffer
    },
  },
  define: {
    global: 'window', // Polyfill global as window
    'process.env': {}, // Polyfill process.env
  },
})
