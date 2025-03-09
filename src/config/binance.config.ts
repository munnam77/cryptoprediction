/**
 * Binance API Configuration
 * Contains settings and endpoints for Binance API
 */

// API Base URLs
export const API_BASE_URL = 'https://api.binance.com';
export const API_TESTNET_URL = 'https://testnet.binance.vision';

// WebSocket Base URLs
export const WS_BASE_URL = 'wss://stream.binance.com:9443';
export const WS_TESTNET_URL = 'wss://testnet.binance.vision';

// API Settings
export const API_CONFIG = {
  // Use false in production, true for testing
  useTestnet: false,
  
  // Base URL based on environment
  get baseUrl() {
    return this.useTestnet ? API_TESTNET_URL : API_BASE_URL;
  },
  
  // WebSocket URL based on environment
  get wsUrl() {
    return this.useTestnet ? WS_TESTNET_URL : WS_BASE_URL;
  },
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Default request headers
  headers: {
    'Content-Type': 'application/json'
  },
  
  // API rate limits
  rateLimits: {
    // Requests per minute
    requestsPerMinute: 1200,
    // Orders per second
    ordersPerSecond: 10
  }
};

// WebSocket Settings
export const WS_CONFIG = {
  // WebSocket reconnection settings
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    delay: 3000  // ms between reconnection attempts
  },
  
  // WebSocket stream types
  streams: {
    ticker: '/ws/ticker',
    depth: '/ws/depth',
    trades: '/ws/trades',
    kline: '/ws/kline'
  }
};

// REST API Endpoints
export const ENDPOINTS = {
  // Public Endpoints
  exchange: {
    info: '/api/v3/exchangeInfo',
    serverTime: '/api/v3/time',
    ping: '/api/v3/ping'
  },
  
  // Market Data Endpoints
  market: {
    depth: '/api/v3/depth',
    trades: '/api/v3/trades',
    historicalTrades: '/api/v3/historicalTrades',
    aggTrades: '/api/v3/aggTrades',
    klines: '/api/v3/klines',
    ticker24hr: '/api/v3/ticker/24hr',
    tickerPrice: '/api/v3/ticker/price',
    bookTicker: '/api/v3/ticker/bookTicker'
  }
};

export default {
  API_CONFIG,
  WS_CONFIG,
  ENDPOINTS
};