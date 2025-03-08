// Mock database configuration for development
// Instead of using @vercel/postgres, we'll use in-memory storage

// Define a mock db object with similar interface to @vercel/postgres
export const db = {
  connect: async () => {
    console.log('Using mock database implementation');
    return Promise.resolve();
  },
  query: async (text: string, params?: any[]) => {
    console.log('Mock query:', text, params);
    return { rows: [], rowCount: 0 };
  },
  end: async () => {
    return Promise.resolve();
  }
};

/**
 * Database configuration settings
 */
export interface DBConfig {
  MIN_DATA_POINTS: number;
  MARKET_CAP: {
    MIN: number;
    MAX: number;
  };
  TIMEFRAMES: {
    [key in TimeframeOption]: number;
  };
}

export type TimeframeOption = '15m' | '30m' | '1h' | '4h' | '1d';

export const TIMEFRAME_OPTIONS: string[] = ['15m', '30m', '1h', '4h', '1d'];

/**
 * Database configuration constants
 */
export const DB_CONFIG: DBConfig = {
  MIN_DATA_POINTS: 50,
  MARKET_CAP: {
    MIN: 10_000_000, // $10M
    MAX: 500_000_000, // $500M
  },
  TIMEFRAMES: {
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  }
};

/**
 * Database tables for IndexedDB
 */
export const DB_TABLES = {
  PRICE_DATA: 'price_data',
  PREDICTIONS: 'predictions',
  TIMEFRAME_METRICS: 'timeframe_metrics',
  TOP_PICKS: 'top_picks',
  COIN_METADATA: 'coin_metadata',
  SENTIMENT_DATA: 'sentiment_data',
  ALERTS: 'user_alerts',
  USER_PREFERENCES: 'user_preferences'
};

/**
 * Database indexes for quick querying
 */
export const DB_INDEXES = {
  PRICE_DATA: {
    BY_TRADING_PAIR: 'trading_pair',
    BY_TIMESTAMP: 'timestamp',
    BY_PAIR_AND_TIME: 'pair_time'
  },
  PREDICTIONS: {
    BY_TRADING_PAIR: 'trading_pair',
    BY_TIMEFRAME: 'timeframe',
    BY_TIMESTAMP: 'timestamp',
    BY_CONFIDENCE: 'confidence_score'
  },
  TIMEFRAME_METRICS: {
    BY_TRADING_PAIR: 'trading_pair',
    BY_TIMEFRAME: 'timeframe',
    BY_TIMESTAMP: 'timestamp'
  },
  SENTIMENT_DATA: {
    BY_ASSET: 'asset',
    BY_TIMESTAMP: 'timestamp'
  },
  ALERTS: {
    BY_TRADING_PAIR: 'trading_pair',
    BY_TYPE: 'alert_type',
    BY_TRIGGERED: 'triggered'
  }
};

/**
 * Database schema version for migration handling
 */
export const DB_SCHEMA_VERSION = 2;