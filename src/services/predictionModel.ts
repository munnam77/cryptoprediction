import type { BinanceKline, MarketData } from '../types/binance';

/**
 * Advanced Prediction Model
 * 
 * Uses a combination of technical indicators, pattern recognition, and statistical analysis
 * to generate price predictions with confidence scores.
 */

// Technical indicators
const calculateRSI = (klines: BinanceKline[], period: number = 14): number => {
  if (klines.length < period + 1) {
    return 50; // Default to neutral if not enough data
  }
  
  let gains = 0;
  let losses = 0;
  
  // Calculate average gains and losses
  for (let i = 1; i <= period; i++) {
    const currentClose = parseFloat(klines[klines.length - i].close);
    const previousClose = parseFloat(klines[klines.length - i - 1].close);
    const change = currentClose - previousClose;
    
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change; // Make losses positive
    }
  }
  
  // Calculate RS and RSI
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) {
    return 100; // No losses means RSI is 100
  }
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
};

const calculateMACD = (klines: BinanceKline[]): { macd: number; signal: number; histogram: number } => {
  if (klines.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  // Calculate EMAs
  const closePrices = klines.map(k => parseFloat(k.close));
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  
  // Calculate MACD line
  const macd = ema12 - ema26;
  
  // Calculate signal line (9-day EMA of MACD)
  const macdValues = closePrices.map((_, i) => {
    if (i < 25) return 0;
    return calculateEMA(closePrices.slice(0, i + 1), 12) - calculateEMA(closePrices.slice(0, i + 1), 26);
  }).slice(-9);
  
  const signal = calculateEMA(macdValues, 9);
  
  // Calculate histogram
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
};

const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) {
    return prices[prices.length - 1];
  }
  
  // Calculate SMA for initial EMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[prices.length - 1 - i];
  }
  let sma = sum / period;
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA
  let ema = sma;
  for (let i = prices.length - period - 1; i >= 0; i--) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
};

const calculateBollingerBands = (klines: BinanceKline[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } => {
  if (klines.length < period) {
    const lastClose = parseFloat(klines[klines.length - 1].close);
    return { upper: lastClose * 1.02, middle: lastClose, lower: lastClose * 0.98 };
  }
  
  // Calculate SMA
  const closePrices = klines.slice(-period).map(k => parseFloat(k.close));
  const sma = closePrices.reduce((sum, price) => sum + price, 0) / period;
  
  // Calculate standard deviation
  const squaredDiffs = closePrices.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate bands
  const upper = sma + (standardDeviation * stdDev);
  const lower = sma - (standardDeviation * stdDev);
  
  return { upper, middle: sma, lower };
};

// Volume analysis
const calculateVolumeProfile = (klines: BinanceKline[]): { buyVolume: number; sellVolume: number; ratio: number } => {
  let buyVolume = 0;
  let sellVolume = 0;
  
  klines.forEach(kline => {
    const open = parseFloat(kline.open);
    const close = parseFloat(kline.close);
    const volume = parseFloat(kline.volume);
    
    if (close >= open) {
      // Bullish candle
      buyVolume += volume;
    } else {
      // Bearish candle
      sellVolume += volume;
    }
  });
  
  const ratio = buyVolume / (buyVolume + sellVolume);
  
  return { buyVolume, sellVolume, ratio };
};

// Pattern recognition
const detectPatterns = (klines: BinanceKline[]): { pattern: string; strength: number } => {
  if (klines.length < 5) {
    return { pattern: 'unknown', strength: 0 };
  }
  
  const closePrices = klines.map(k => parseFloat(k.close));
  const openPrices = klines.map(k => parseFloat(k.open));
  const highPrices = klines.map(k => parseFloat(k.high));
  const lowPrices = klines.map(k => parseFloat(k.low));
  
  // Check for bullish engulfing
  if (
    closePrices[closePrices.length - 1] > openPrices[openPrices.length - 1] &&
    closePrices[closePrices.length - 2] < openPrices[openPrices.length - 2] &&
    closePrices[closePrices.length - 1] > openPrices[openPrices.length - 2] &&
    openPrices[openPrices.length - 1] < closePrices[closePrices.length - 2]
  ) {
    return { pattern: 'bullish_engulfing', strength: 0.8 };
  }
  
  // Check for bearish engulfing
  if (
    closePrices[closePrices.length - 1] < openPrices[openPrices.length - 1] &&
    closePrices[closePrices.length - 2] > openPrices[openPrices.length - 2] &&
    closePrices[closePrices.length - 1] < openPrices[openPrices.length - 2] &&
    openPrices[openPrices.length - 1] > closePrices[closePrices.length - 2]
  ) {
    return { pattern: 'bearish_engulfing', strength: 0.8 };
  }
  
  // Check for doji
  const lastCandleSize = Math.abs(closePrices[closePrices.length - 1] - openPrices[openPrices.length - 1]);
  const lastCandleRange = highPrices[highPrices.length - 1] - lowPrices[lowPrices.length - 1];
  
  if (lastCandleSize / lastCandleRange < 0.1) {
    return { pattern: 'doji', strength: 0.5 };
  }
  
  // Check for hammer
  const lastCandleBody = Math.abs(closePrices[closePrices.length - 1] - openPrices[openPrices.length - 1]);
  const lastCandleLowerWick = Math.min(closePrices[closePrices.length - 1], openPrices[openPrices.length - 1]) - lowPrices[lowPrices.length - 1];
  const lastCandleUpperWick = highPrices[highPrices.length - 1] - Math.max(closePrices[closePrices.length - 1], openPrices[openPrices.length - 1]);
  
  if (
    lastCandleLowerWick > lastCandleBody * 2 &&
    lastCandleUpperWick < lastCandleBody * 0.5 &&
    closePrices[closePrices.length - 2] < closePrices[closePrices.length - 1]
  ) {
    return { pattern: 'hammer', strength: 0.7 };
  }
  
  return { pattern: 'none', strength: 0 };
};

// Main prediction function
export const generatePrediction = (marketData: MarketData, klines: BinanceKline[]): { prediction: 'up' | 'down' | 'neutral'; confidence: number } => {
  if (klines.length < 30) {
    return { prediction: 'neutral', confidence: 50 };
  }
  
  // Calculate technical indicators
  const rsi = calculateRSI(klines);
  const macd = calculateMACD(klines);
  const bollingerBands = calculateBollingerBands(klines);
  const volumeProfile = calculateVolumeProfile(klines);
  const pattern = detectPatterns(klines);
  
  // Current price
  const currentPrice = parseFloat(klines[klines.length - 1].close);
  
  // Calculate signals
  let bullishSignals = 0;
  let bearishSignals = 0;
  let totalSignals = 0;
  
  // RSI signal (0-100)
  if (rsi < 30) {
    bullishSignals += 1; // Oversold
  } else if (rsi > 70) {
    bearishSignals += 1; // Overbought
  }
  totalSignals += 1;
  
  // MACD signal
  if (macd.histogram > 0 && macd.histogram > macd.signal) {
    bullishSignals += 1; // Bullish momentum
  } else if (macd.histogram < 0 && macd.histogram < macd.signal) {
    bearishSignals += 1; // Bearish momentum
  }
  totalSignals += 1;
  
  // Bollinger Bands signal
  if (currentPrice < bollingerBands.lower) {
    bullishSignals += 1; // Price below lower band (potential bounce)
  } else if (currentPrice > bollingerBands.upper) {
    bearishSignals += 1; // Price above upper band (potential reversal)
  }
  totalSignals += 1;
  
  // Volume profile signal
  if (volumeProfile.ratio > 0.6) {
    bullishSignals += 1; // More buying volume
  } else if (volumeProfile.ratio < 0.4) {
    bearishSignals += 1; // More selling volume
  }
  totalSignals += 1;
  
  // Pattern signal
  if (pattern.pattern.includes('bullish')) {
    bullishSignals += pattern.strength;
  } else if (pattern.pattern.includes('bearish')) {
    bearishSignals += pattern.strength;
  }
  totalSignals += pattern.strength;
  
  // Price change signal
  if (marketData.priceChangePercent > 3) {
    bullishSignals += 0.5; // Strong recent performance
  } else if (marketData.priceChangePercent < -3) {
    bearishSignals += 0.5; // Weak recent performance
  }
  totalSignals += 0.5;
  
  // Volume change signal
  if (marketData.volumeChangePercent > 20) {
    bullishSignals += 0.5; // Volume increasing
  } else if (marketData.volumeChangePercent < -20) {
    bearishSignals += 0.5; // Volume decreasing
  }
  totalSignals += 0.5;
  
  // Calculate final prediction
  const bullishPercentage = (bullishSignals / totalSignals) * 100;
  const bearishPercentage = (bearishSignals / totalSignals) * 100;
  
  let prediction: 'up' | 'down' | 'neutral';
  let confidence: number;
  
  if (bullishPercentage > bearishPercentage + 10) {
    prediction = 'up';
    confidence = Math.round(bullishPercentage);
  } else if (bearishPercentage > bullishPercentage + 10) {
    prediction = 'down';
    confidence = Math.round(bearishPercentage);
  } else {
    prediction = 'neutral';
    confidence = Math.round(50 + (bullishPercentage - bearishPercentage));
  }
  
  // Ensure confidence is within 0-100 range
  confidence = Math.max(0, Math.min(100, confidence));
  
  return { prediction, confidence };
};

// Export functions for use in other modules
export default {
  generatePrediction,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateVolumeProfile,
  detectPatterns
};