// Database schema SQL queries for initial setup

export const CREATE_TABLES = {
  // Store raw crypto price data with timestamps for timeframe-specific calculations
  RAW_PRICE_DATA: `
    CREATE TABLE IF NOT EXISTS raw_price_data (
      id SERIAL PRIMARY KEY,
      trading_pair VARCHAR(20) NOT NULL,
      price DECIMAL(24, 8) NOT NULL,
      volume DECIMAL(24, 8) NOT NULL,
      market_cap DECIMAL(24, 8),
      timestamp BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      
      -- Indexes for faster queries by timeframe
      CONSTRAINT raw_price_data_pair_time_unique UNIQUE(trading_pair, timestamp)
    )
  `,
  
  // Store pre-calculated metrics for each timeframe to improve query performance
  TIMEFRAME_METRICS: `
    CREATE TABLE IF NOT EXISTS timeframe_metrics (
      id SERIAL PRIMARY KEY,
      trading_pair VARCHAR(20) NOT NULL,
      timeframe VARCHAR(5) NOT NULL,
      price_start DECIMAL(24, 8) NOT NULL,
      price_end DECIMAL(24, 8) NOT NULL,
      price_change_pct DECIMAL(10, 2),
      volume_start DECIMAL(24, 8),
      volume_end DECIMAL(24, 8),
      volume_change_pct DECIMAL(10, 2),
      volatility_score DECIMAL(5, 2),
      liquidity_score DECIMAL(5, 2),
      timestamp BIGINT NOT NULL,
      
      -- Indexes for faster queries
      CONSTRAINT timeframe_metrics_pair_time_frame_unique UNIQUE(trading_pair, timeframe, timestamp)
    )
  `,
  
  // Store predictions made by our engine for each timeframe
  PREDICTIONS: `
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      trading_pair VARCHAR(20) NOT NULL,
      timeframe VARCHAR(5) NOT NULL,
      predicted_change_pct DECIMAL(10, 2) NOT NULL,
      confidence_score DECIMAL(5, 2) NOT NULL,
      actual_change_pct DECIMAL(10, 2),
      was_accurate BOOLEAN,
      prediction_timestamp BIGINT NOT NULL,
      evaluation_timestamp BIGINT,
      
      -- Indexes for analysis
      CONSTRAINT prediction_pair_time_frame_timestamp UNIQUE(trading_pair, timeframe, prediction_timestamp)
    )
  `,
  
  // Store data about top picks (low cap gems)
  TOP_PICKS: `
    CREATE TABLE IF NOT EXISTS top_picks (
      id SERIAL PRIMARY KEY,
      trading_pair VARCHAR(20) NOT NULL,
      market_cap DECIMAL(24, 8) NOT NULL,
      selection_reason TEXT,
      predicted_peak_timeframe VARCHAR(5),
      prediction_confidence DECIMAL(5, 2),
      selected_at BIGINT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Ensure uniqueness for active picks
      CONSTRAINT top_picks_active_pair UNIQUE(trading_pair, is_active)
    )
  `,
  
  // Store coin metadata including market cap for filtering
  COIN_METADATA: `
    CREATE TABLE IF NOT EXISTS coin_metadata (
      id SERIAL PRIMARY KEY,
      trading_pair VARCHAR(20) NOT NULL,
      name VARCHAR(100),
      ticker VARCHAR(20),
      market_cap DECIMAL(24, 8),
      is_top_10 BOOLEAN DEFAULT FALSE,
      is_excluded BOOLEAN DEFAULT FALSE,
      last_updated_at BIGINT NOT NULL,
      
      -- Indexes for quick lookups
      CONSTRAINT coin_metadata_pair_unique UNIQUE(trading_pair)
    )
  `,
  
  // Store sentiment analysis from X (Twitter) and news
  SENTIMENT_DATA: `
    CREATE TABLE IF NOT EXISTS sentiment_data (
      id SERIAL PRIMARY KEY,
      trading_pair VARCHAR(20) NOT NULL,
      sentiment_score DECIMAL(5, 2) NOT NULL,
      source VARCHAR(50) NOT NULL,
      post_count INTEGER,
      timestamp BIGINT NOT NULL,
      
      -- Indexes for analysis
      CONSTRAINT sentiment_pair_source_time UNIQUE(trading_pair, source, timestamp)
    )
  `
};

// Functions to initialize the database
export const initializeDatabase = async (client: any) => {
  try {
    // Create tables in the correct order (respecting dependencies)
    await client.sql`${CREATE_TABLES.RAW_PRICE_DATA}`;
    await client.sql`${CREATE_TABLES.TIMEFRAME_METRICS}`;
    await client.sql`${CREATE_TABLES.PREDICTIONS}`;
    await client.sql`${CREATE_TABLES.TOP_PICKS}`;
    await client.sql`${CREATE_TABLES.COIN_METADATA}`;
    await client.sql`${CREATE_TABLES.SENTIMENT_DATA}`;
    
    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    return false;
  }
};

// Create indexes for performance optimization
export const CREATE_INDEXES = {
  RAW_PRICE_DATA_TRADING_PAIR_IDX: `
    CREATE INDEX IF NOT EXISTS raw_price_data_trading_pair_idx ON raw_price_data (trading_pair)
  `,
  RAW_PRICE_DATA_TIMESTAMP_IDX: `
    CREATE INDEX IF NOT EXISTS raw_price_data_timestamp_idx ON raw_price_data (timestamp)
  `,
  TIMEFRAME_METRICS_TIMEFRAME_IDX: `
    CREATE INDEX IF NOT EXISTS timeframe_metrics_timeframe_idx ON timeframe_metrics (timeframe)
  `,
  PREDICTIONS_TIMEFRAME_IDX: `
    CREATE INDEX IF NOT EXISTS predictions_timeframe_idx ON predictions (timeframe)
  `,
  COIN_METADATA_MARKET_CAP_IDX: `
    CREATE INDEX IF NOT EXISTS coin_metadata_market_cap_idx ON coin_metadata (market_cap)
  `,
};

// Create the indexes
export const createIndexes = async (client: any) => {
  try {
    // Create all indexes
    for (const indexQuery of Object.values(CREATE_INDEXES)) {
      await client.query(indexQuery);
    }
    
    console.log('Database indexes created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create database indexes:', error);
    return false;
  }
};