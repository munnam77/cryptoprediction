/**
 * Extended types for market data used throughout the application
 */

import { BinanceKline } from '../services/BinanceService';

// Base market data interface as defined in BinanceService
export interface BaseMarketData {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  volumeChangePercent: number;
  marketCap?: number;
  historicalData?: BinanceKline[];
  volatility?: number;
  liquidity?: number;
}

// Breakout information structure
export interface BreakoutInfo {
  price: number;
  type: 'resistance' | 'support';
  time: string; // ISO string format for dates
  strength: number; // 0-100
}

// Trend information structure
export interface TrendInfo {
  direction: 'up' | 'down' | 'sideways';
  strength: number; // 0-100
  duration: number; // in minutes or candles
  breakoutPotential?: number; // 0-100
}

// Price pivot information
export interface PivotInfo {
  price: number;
  type: 'support' | 'resistance' | 'fibonacci';
  strength: number; // 0-100
}

// Extended market data interface with all properties needed for dashboard components
export interface MarketData extends BaseMarketData {
  // Trading data
  orderBookImbalance?: number; // 0-100 percentage of buy vs sell orders
  liquidity?: number; // 0-100 score based on order book depth and spread
  
  // Technical indicators
  trend?: TrendInfo;
  breakout?: BreakoutInfo;
  pivotPoint?: PivotInfo;
  rsi?: number; // 0-100 Relative Strength Index
  macd?: {
    value: number;
    signal: number;
    histogram: number;
  };
  
  // Volatility metrics
  volatilityTrend?: 'increasing' | 'decreasing' | 'stable';
  volatilityRank?: number; // 0-100 compared to historical
  
  // Sentiment and momentum
  sentimentScore?: number; // 0-100
  momentum?: number; // -100 to 100
  pumpProbability?: number; // 0-100
  
  // Trading signals
  signalDirection?: 'buy' | 'sell' | 'neutral';
  signalStrength?: number; // 0-100
  profitTarget?: number; // in percentage
  stopLoss?: number; // in percentage
  
  // Whale activity
  whaleActivity?: {
    buyPressure: number; // 0-100
    sellPressure: number; // 0-100
    lastTransaction?: {
      type: 'buy' | 'sell';
      amount: number;
      time: string;
    }
  };
  
  // Risk metrics
  riskScore?: number; // 0-100
  riskRewardRatio?: number;

  // New fields
  orderBookRatio?: number;
  priceVelocityTrend?: 'accelerating' | 'decelerating' | 'stable';
  tradingZones?: Array<{
    price: number;
    heat: number;
  }>;
  btcCorrelation?: number;
  sentiment?: number;
  sentimentSpike?: number;
  volumeDecay?: number;
  indicators?: {
    rsi: number;
    volatility: number;
    momentum: number;
  };
}
