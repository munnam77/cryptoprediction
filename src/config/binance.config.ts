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
  baseUrl: 'https://api.binance.com',
  rateLimits: {
    requestsPerMinute: 1200, // Binance allows 1200 requests per minute
    requestWeight: 10 // Default weight for most endpoints
  },
  timeout: 30000 // 30 seconds timeout
};

// WebSocket Settings
export const WS_CONFIG = {
  baseUrl: 'wss://stream.binance.com:9443/ws',
  combinedStreamsBaseUrl: 'wss://stream.binance.com:9443/stream',
  reconnectDelay: 5000, // 5 seconds
  maxReconnectAttempts: 5
};

// REST API Endpoints
export const ENDPOINTS = {
  exchangeInfo: '/api/v3/exchangeInfo',
  ticker24hr: '/api/v3/ticker/24hr',
  klines: '/api/v3/klines',
  depth: '/api/v3/depth',
  trades: '/api/v3/trades',
  aggTrades: '/api/v3/aggTrades'
};

export const TIMEFRAMES = {
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000
};

export default {
  API_CONFIG,
  WS_CONFIG,
  ENDPOINTS,
  TIMEFRAMES
};