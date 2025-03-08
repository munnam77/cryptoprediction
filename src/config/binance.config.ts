export const BINANCE_CONFIG = {
  // API Configuration
  API_KEY: import.meta.env.VITE_BINANCE_API_KEY || '',
  API_SECRET: import.meta.env.VITE_BINANCE_API_SECRET || '',
  
  // WebSocket Configuration
  WS_RECONNECT_DELAY: Number(import.meta.env.VITE_WS_RECONNECT_DELAY || 5000),
  WS_MAX_RECONNECT_ATTEMPTS: Number(import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS || 5),
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: Number(import.meta.env.VITE_API_RATE_LIMIT || 1200),
  MAX_ORDERS_PER_SECOND: 10,
  
  // USDT Pairs Configuration
  MINIMUM_VOLUME_24H: Number(import.meta.env.VITE_MINIMUM_VOLUME_24H || 100000),
  MINIMUM_MARKET_CAP: Number(import.meta.env.VITE_MINIMUM_MARKET_CAP || 10000000),
  
  // Blacklisted pairs (e.g., known problematic tokens)
  BLACKLISTED_PAIRS: [
    'USDC', 
    'USDT', 
    'BUSD', 
    'DAI', 
    'UST'
  ],
  
  // Update Intervals
  PRICE_UPDATE_INTERVAL: 60000,
  VOLUME_UPDATE_INTERVAL: 60000,
  ORDERBOOK_UPDATE_INTERVAL: 1000,
  
  // Cache Configuration
  CACHE_DURATION: {
    PRICE: Number(import.meta.env.VITE_CACHE_DURATION_PRICE || 5000),
    KLINES: Number(import.meta.env.VITE_CACHE_DURATION_KLINES || 60000),
    MARKET_DATA: Number(import.meta.env.VITE_CACHE_DURATION_MARKET_DATA || 60000),
    CANDLES: 300000,
    ORDER_BOOK: 10000,
  },
  
  // Error Handling
  RETRY_ATTEMPTS: Number(import.meta.env.VITE_ERROR_RETRY_ATTEMPTS || 3),
  RETRY_DELAY: Number(import.meta.env.VITE_ERROR_RETRY_DELAY || 1000),
  EXPONENTIAL_BACKOFF: true,
  
  // Validation
  MINIMUM_PRICE: 0.00000001,
  MAXIMUM_PRICE_DIGITS: 8,
  MAXIMUM_QUANTITY_DIGITS: 8,
};