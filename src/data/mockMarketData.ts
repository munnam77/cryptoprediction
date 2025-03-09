interface TimeframeData {
  '15m': number | null;
  '30m': number | null;
  '1h': number | null;
  '4h': number | null;
  '1d': number | null;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChangePercent: TimeframeData;
  volumeChangePercent: TimeframeData;
  marketCap?: number;
  volume24h: number;
  liquidityScore: number;
  volatility: TimeframeData;
  updatedAt: number;
  predictionConfidence?: number;
  volume: number;
  orderBookImbalance?: number;
  breakout?: {
    price: number;
    type: 'resistance' | 'support';
    time: number;
  };
  pivotPoint?: {
    price: number;
    type: 'resistance' | 'support';
    strength: number;
  };
  trend?: {
    direction: 'up' | 'down' | 'sideways';
    strength: number;
    duration: number;
  };
  tradingZones?: Array<{
    price: number;
    intensity: number;
  }>;
  priceVelocity?: number;
  priceVelocityTrend?: 'accelerating' | 'decelerating' | 'stable';
  pumpProbability?: number;
  profitTarget?: number;
  rsi?: number;
  btcCorrelation?: number;
}

const defaultTimeframeData: TimeframeData = {
  '15m': null,
  '30m': null,
  '1h': null,
  '4h': null,
  '1d': null
};

// Add these fields to the existing mock data entries
const extendedMockData = {
  volume: 5000000,
  orderBookImbalance: 55,
  breakout: {
    price: 45100,
    type: 'resistance' as const,
    time: Date.now()
  },
  pivotPoint: {
    price: 44900,
    type: 'support' as const,
    strength: 75
  },
  trend: {
    direction: 'up' as const,
    strength: 65,
    duration: 3600
  },
  tradingZones: [
    { price: 44800, intensity: 80 },
    { price: 45200, intensity: 70 }
  ],
  priceVelocity: 0.015,
  priceVelocityTrend: 'accelerating' as const,
  pumpProbability: 75,
  profitTarget: 2.5,
  rsi: 65,
  btcCorrelation: 85
};

// Default mock data for top gainers
export const topGainers: MarketData[] = [
  {
    symbol: 'BTCUSDT',
    price: 45000,
    priceChangePercent: {
      ...defaultTimeframeData,
      '1h': 5.2
    },
    volumeChangePercent: {
      ...defaultTimeframeData,
      '1h': 15
    },
    marketCap: 800000000000,
    volume24h: 1000000000,
    liquidityScore: 95,
    volatility: {
      ...defaultTimeframeData,
      '1h': 45
    },
    updatedAt: Date.now(),
    predictionConfidence: 75,
    ...extendedMockData
  },
  {
    symbol: 'ETHUSDT',
    price: 2800,
    priceChangePercent: {
      ...defaultTimeframeData,
      '1h': 4.8
    },
    volumeChangePercent: {
      ...defaultTimeframeData,
      '1h': 12
    },
    marketCap: 300000000000,
    volume24h: 500000000,
    liquidityScore: 90,
    volatility: {
      ...defaultTimeframeData,
      '1h': 50
    },
    updatedAt: Date.now(),
    predictionConfidence: 70,
    ...extendedMockData,
    pumpProbability: 65,
    profitTarget: 2.0
  }
];

// Default mock data for low cap gems
export const lowCapGems: MarketData[] = [
  {
    symbol: 'FETUSDT',
    price: 0.45,
    priceChangePercent: {
      ...defaultTimeframeData,
      '1h': 12.5
    },
    volumeChangePercent: {
      ...defaultTimeframeData,
      '1h': 150
    },
    marketCap: 150000000,
    volume24h: 5000000,
    liquidityScore: 60,
    volatility: {
      ...defaultTimeframeData,
      '1h': 75
    },
    updatedAt: Date.now(),
    predictionConfidence: 85,
    ...extendedMockData,
    pumpProbability: 85,
    profitTarget: 5.0
  },
  {
    symbol: 'AGIXUSDT',
    price: 0.28,
    priceChangePercent: {
      ...defaultTimeframeData,
      '1h': 8.5
    },
    volumeChangePercent: {
      ...defaultTimeframeData,
      '1h': 120
    },
    marketCap: 100000000,
    volume24h: 3000000,
    liquidityScore: 55,
    volatility: {
      ...defaultTimeframeData,
      '1h': 80
    },
    updatedAt: Date.now(),
    predictionConfidence: 80,
    ...extendedMockData,
    pumpProbability: 80,
    profitTarget: 4.5
  }
];

// Mock all market data
export const allMarketData: MarketData[] = [
  ...topGainers,
  ...lowCapGems
];

export default {
  topGainers,
  lowCapGems,
  allMarketData
};
