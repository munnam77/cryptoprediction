import { MarketData } from '../services/BinanceService';

/**
 * Mock market data for immediate UI display
 * Used to populate the UI while waiting for real data to load
 */

// Mock top gainers data
export const topGainers: MarketData[] = [
  {
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    price: 62458.34,
    priceChangePercent: 5.42,
    volume: 9876543210,
    volumeChangePercent: 15.3,
    marketCap: 1209876543210,
    volatility: 45,
    liquidity: 85
  },
  {
    symbol: 'ETHUSDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    price: 3287.65,
    priceChangePercent: 7.81,
    volume: 5432198760,
    volumeChangePercent: 23.5,
    marketCap: 401234567890,
    volatility: 53,
    liquidity: 78
  },
  {
    symbol: 'SOLUSDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    price: 145.67,
    priceChangePercent: 12.5,
    volume: 2345678901,
    volumeChangePercent: 35.7,
    marketCap: 71234567890,
    volatility: 68,
    liquidity: 65
  },
  {
    symbol: 'DOGEUSDT',
    baseAsset: 'DOGE',
    quoteAsset: 'USDT',
    price: 0.1234,
    priceChangePercent: 8.92,
    volume: 3456789012,
    volumeChangePercent: 28.9,
    marketCap: 16234567890,
    volatility: 72,
    liquidity: 58
  },
  {
    symbol: 'BNBUSDT',
    baseAsset: 'BNB',
    quoteAsset: 'USDT',
    price: 578.34,
    priceChangePercent: 6.54,
    volume: 1234567890,
    volumeChangePercent: 19.2,
    marketCap: 87654321000,
    volatility: 40,
    liquidity: 88
  }
];

// Mock low cap gems data
export const lowCapGems: MarketData[] = [
  {
    symbol: 'HBARUSDT',
    baseAsset: 'HBAR',
    quoteAsset: 'USDT',
    price: 0.0843,
    priceChangePercent: 15.7,
    volume: 234567890,
    volumeChangePercent: 45.2,
    marketCap: 2345678900,
    volatility: 75,
    liquidity: 35
  },
  {
    symbol: 'FLOKIUSDT',
    baseAsset: 'FLOKI',
    quoteAsset: 'USDT',
    price: 0.0002345,
    priceChangePercent: 18.3,
    volume: 123456789,
    volumeChangePercent: 58.7,
    marketCap: 1234567890,
    volatility: 82,
    liquidity: 28
  },
  {
    symbol: 'VETUSDT',
    baseAsset: 'VET',
    quoteAsset: 'USDT',
    price: 0.0357,
    priceChangePercent: 11.8,
    volume: 345678901,
    volumeChangePercent: 32.6,
    marketCap: 2567890123,
    volatility: 65,
    liquidity: 42
  },
  {
    symbol: 'ONEUSDT',
    baseAsset: 'ONE',
    quoteAsset: 'USDT',
    price: 0.0168,
    priceChangePercent: 14.3,
    volume: 98765432,
    volumeChangePercent: 38.9,
    marketCap: 876543210,
    volatility: 70,
    liquidity: 32
  },
  {
    symbol: 'ICPUSDT',
    baseAsset: 'ICP',
    quoteAsset: 'USDT',
    price: 12.56,
    priceChangePercent: 16.2,
    volume: 213456789,
    volumeChangePercent: 43.8,
    marketCap: 3123456789,
    volatility: 68,
    liquidity: 45
  }
];

// Mock all market data
export const allMarketData: MarketData[] = [
  ...topGainers,
  ...lowCapGems,
  {
    symbol: 'ADAUSDT',
    baseAsset: 'ADA',
    quoteAsset: 'USDT',
    price: 0.5879,
    priceChangePercent: 3.25,
    volume: 789012345,
    volumeChangePercent: 12.5,
    marketCap: 23456789012,
    volatility: 48,
    liquidity: 72
  },
  {
    symbol: 'DOTUSDT',
    baseAsset: 'DOT',
    quoteAsset: 'USDT',
    price: 8.43,
    priceChangePercent: -2.15,
    volume: 456789012,
    volumeChangePercent: -5.3,
    marketCap: 10234567890,
    volatility: 55,
    liquidity: 68
  },
  {
    symbol: 'XRPUSDT',
    baseAsset: 'XRP',
    quoteAsset: 'USDT',
    price: 0.5643,
    priceChangePercent: 2.87,
    volume: 890123456,
    volumeChangePercent: 9.2,
    marketCap: 31234567890,
    volatility: 42,
    liquidity: 76
  },
  {
    symbol: 'LINKUSDT',
    baseAsset: 'LINK',
    quoteAsset: 'USDT',
    price: 15.67,
    priceChangePercent: 4.32,
    volume: 345678901,
    volumeChangePercent: 14.7,
    marketCap: 9876543210,
    volatility: 52,
    liquidity: 65
  },
  {
    symbol: 'MATICUSDT',
    baseAsset: 'MATIC',
    quoteAsset: 'USDT',
    price: 0.8765,
    priceChangePercent: 5.67,
    volume: 567890123,
    volumeChangePercent: 18.9,
    marketCap: 8765432100,
    volatility: 58,
    liquidity: 63
  }
];

const mockMarketData = {
  topGainers,
  lowCapGems,
  allMarketData
};

export default mockMarketData;
