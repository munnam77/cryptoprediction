import { sql } from '@vercel/postgres';
import { BINANCE_CONFIG } from '../../config/binance.config';

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
}

interface PredictionRecord {
  id: string;
  symbol: string;
  prediction: number;
  actual: number;
  timestamp: Date;
  accuracy: number;
  timeframe: string;
}

// Initialize database tables
export async function initDatabase() {
  try {
    // Create market_data table
    await sql`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        volume DECIMAL(20, 8) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        UNIQUE(symbol, timestamp)
      )
    `;

    // Create predictions table
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        symbol VARCHAR(20) NOT NULL,
        prediction DECIMAL(20, 8) NOT NULL,
        actual DECIMAL(20, 8),
        timestamp TIMESTAMP NOT NULL,
        accuracy DECIMAL(5, 2),
        timeframe VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    throw error;
  }
}

// Store market data
export async function storeMarketData(data: MarketData) {
  try {
    await sql`
      INSERT INTO market_data (symbol, price, volume, timestamp)
      VALUES (${data.symbol}, ${data.price}, ${data.volume}, ${data.timestamp})
      ON CONFLICT (symbol, timestamp)
      DO UPDATE SET price = ${data.price}, volume = ${data.volume}
    `;
  } catch (error) {
    console.error('Failed to store market data:', error);
    throw error;
  }
}

// Get historical market data
export async function getHistoricalData(symbol: string, startTime: Date, endTime: Date) {
  try {
    const result = await sql`
      SELECT * FROM market_data
      WHERE symbol = ${symbol}
      AND timestamp BETWEEN ${startTime} AND ${endTime}
      ORDER BY timestamp ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Failed to get historical data:', error);
    throw error;
  }
}

// Store prediction
export async function storePrediction(prediction: PredictionRecord) {
  try {
    await sql`
      INSERT INTO predictions (
        symbol, prediction, actual, timestamp, accuracy, timeframe
      ) VALUES (
        ${prediction.symbol},
        ${prediction.prediction},
        ${prediction.actual},
        ${prediction.timestamp},
        ${prediction.accuracy},
        ${prediction.timeframe}
      )
    `;
  } catch (error) {
    console.error('Failed to store prediction:', error);
    throw error;
  }
}

// Get prediction accuracy
export async function getPredictionAccuracy(symbol: string, timeframe: string) {
  try {
    const result = await sql`
      SELECT AVG(accuracy) as avg_accuracy
      FROM predictions
      WHERE symbol = ${symbol}
      AND timeframe = ${timeframe}
      AND accuracy IS NOT NULL
      AND created_at >= NOW() - INTERVAL '7 days'
    `;
    return result.rows[0]?.avg_accuracy || 0;
  } catch (error) {
    console.error('Failed to get prediction accuracy:', error);
    throw error;
  }
}