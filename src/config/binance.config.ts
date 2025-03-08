export const BINANCE_CONFIG = {
  // API Configuration
  API_KEY: import.meta.env.VITE_BINANCE_API_KEY || '',
  API_SECRET: import.meta.env.VITE_BINANCE_API_SECRET || '',
  
  // WebSocket Configuration
  WS_RECONNECT_DELAY: 5000, // 5 seconds
  WS_MAX_RECONNECT_ATTEMPTS: 5,
  
  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: 1200,
  MAX_ORDERS_PER_SECOND: 10,
  
  // USDT Pairs Configuration
  MINIMUM_VOLUME_24H: 100000, // Minimum 24h volume in USDT
  MINIMUM_MARKET_CAP: 10000000, // Minimum market cap in USDT
  
  // Blacklisted pairs (e.g., known problematic tokens)
  BLACKLISTED_PAIRS: [
    'USDC', 
    'USDT', 
    'BUSD', 
    'DAI', 
    'UST'
  ],
  
  // Update Intervals
  PRICE_UPDATE_INTERVAL: 60000, // 1 minute
  VOLUME_UPDATE_INTERVAL: 60000, // 1 minute
  ORDERBOOK_UPDATE_INTERVAL: 1000, // 1 second
  
  // Cache Configuration
  CACHE_DURATION: {
    PRICE: 5000, // 5 seconds
    KLINES: 60000, // 1 minute
    MARKET_DATA: 60000, // 1 minute
    CANDLES: 300000, // 5 minutes
    ORDER_BOOK: 10000, // 10 seconds
  },
  
  // Error Handling
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  EXPONENTIAL_BACKOFF: true,
  
  // Validation
  MINIMUM_PRICE: 0.00000001,
  MAXIMUM_PRICE_DIGITS: 8,
  MAXIMUM_QUANTITY_DIGITS: 8,
  
  // WebSocket Channels
  WS_CHANNELS: {
    TRADES: false,
    KLINES: false,
    DEPTH: false,
    TICKERS: true,
  }
};