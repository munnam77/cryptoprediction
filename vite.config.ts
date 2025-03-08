import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose environment variables to the browser
    'process.env.SENTIMENT_API_KEY': JSON.stringify(process.env.SENTIMENT_API_KEY),
    'process.env.BINANCE_API_KEY': JSON.stringify(process.env.BINANCE_API_KEY),
    'process.env.BINANCE_API_SECRET': JSON.stringify(process.env.BINANCE_API_SECRET)
  }
})