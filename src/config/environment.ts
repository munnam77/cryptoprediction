/**
 * Environment Configuration
 * 
 * Centralizes environment-specific configuration and feature flags
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// API configuration
const API_CONFIG = {
  // Use environment variables with fallbacks
  BINANCE_API_URL: process.env.VITE_BINANCE_API_URL || 'https://api.binance.com',
  BINANCE_WS_URL: process.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws',
  COINGECKO_API_URL: process.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  
  // API keys (should be set in .env file)
  BINANCE_API_KEY: process.env.VITE_BINANCE_API_KEY || '',
  BINANCE_API_SECRET: process.env.VITE_BINANCE_API_SECRET || '',
  
  // Rate limiting
  RATE_LIMIT_REQUESTS_PER_MINUTE: 1200,
  RATE_LIMIT_WEIGHT: 10,
  
  // Timeouts
  REQUEST_TIMEOUT_MS: 30000,
  
  // Cache TTL
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
};

// Feature flags
const FEATURES = {
  // Core features
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_PREDICTIONS: true,
  ENABLE_WEBSOCKETS: true,
  
  // Performance features
  ENABLE_CACHING: true,
  ENABLE_LAZY_LOADING: true,
  
  // Debug features
  ENABLE_PERFORMANCE_MONITORING: isProduction,
  ENABLE_ERROR_REPORTING: isProduction,
  ENABLE_ANALYTICS: isProduction,
  ENABLE_LOGGING: true,
  
  // UI features
  ENABLE_ANIMATIONS: true,
  ENABLE_DARK_MODE: true,
};

// App configuration
const APP_CONFIG = {
  // App info
  APP_NAME: 'CryptoPrediction',
  APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0',
  
  // UI configuration
  DEFAULT_THEME: 'dark',
  DEFAULT_TIMEFRAME: '1h',
  REFRESH_INTERVAL_MS: 30 * 1000, // 30 seconds
  
  // Data configuration
  MAX_PAIRS_TO_DISPLAY: 100,
  DEFAULT_TOP_PICKS_COUNT: 10,
  
  // Market cap filters
  MIN_MARKET_CAP: 10000000, // $10M
  MAX_MARKET_CAP: 500000000, // $500M
};

// Logging configuration
const LOGGING_CONFIG = {
  LOG_LEVEL: isProduction ? 'info' : 'debug',
  ENABLE_REMOTE_LOGGING: isProduction,
  REMOTE_LOGGING_URL: process.env.VITE_REMOTE_LOGGING_URL || '',
  MAX_LOGS_IN_MEMORY: 1000,
};

// Export configuration
export default {
  isDevelopment,
  isProduction,
  isTest,
  API_CONFIG,
  FEATURES,
  APP_CONFIG,
  LOGGING_CONFIG,
}; 