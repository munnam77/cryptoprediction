import {
  RSI,
  MACD,
  BollingerBands,
  SMA,
  EMA,
  ADX,
  ATR,
  ROC
} from 'technicalindicators';

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  adx: number;
  atr: number;
  roc: number;
}

export function calculateRSI(prices: number[], period: number = 14): number {
  const rsi = new RSI({ period, values: prices });
  const results = rsi.getResult();
  return results[results.length - 1];
}

export function calculateMACD(prices: number[]): {
  macdLine: number;
  signalLine: number;
  histogram: number;
} {
  const macd = new MACD({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  const results = macd.getResult();
  const latest = results[results.length - 1];

  return {
    macdLine: latest.MACD,
    signalLine: latest.signal,
    histogram: latest.histogram
  };
}

export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} {
  const bb = new BollingerBands({
    period,
    values: prices,
    stdDev
  });

  const results = bb.getResult();
  const latest = results[results.length - 1];

  return {
    upper: latest.upper,
    middle: latest.middle,
    lower: latest.lower
  };
}

export function calculateTrend(prices: number[]): 'up' | 'down' | 'sideways' {
  const sma20 = new SMA({ period: 20, values: prices });
  const sma50 = new SMA({ period: 50, values: prices });
  
  const sma20Results = sma20.getResult();
  const sma50Results = sma50.getResult();
  
  const latestSMA20 = sma20Results[sma20Results.length - 1];
  const latestSMA50 = sma50Results[sma50Results.length - 1];
  const prevSMA20 = sma20Results[sma20Results.length - 2];
  
  if (latestSMA20 > latestSMA50 && latestSMA20 > prevSMA20) {
    return 'up';
  } else if (latestSMA20 < latestSMA50 && latestSMA20 < prevSMA20) {
    return 'down';
  }
  return 'sideways';
}

export function calculateVolatility(prices: number[]): 'high' | 'medium' | 'low' {
  const atr = new ATR({
    high: prices.map(p => p * 1.001),
    low: prices.map(p => p * 0.999),
    close: prices,
    period: 14
  });
  
  const atrValue = atr.getResult()[atr.getResult().length - 1];
  const averagePrice = prices[prices.length - 1];
  const volatilityPercentage = (atrValue / averagePrice) * 100;
  
  if (volatilityPercentage > 3) return 'high';
  if (volatilityPercentage > 1) return 'medium';
  return 'low';
}

export function calculateMomentum(prices: number[]): number {
  const roc = new ROC({ period: 10, values: prices });
  return roc.getResult()[roc.getResult().length - 1];
}

export function analyzeTechnicals(prices: number[]): TechnicalIndicators {
  return {
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    bollingerBands: calculateBollingerBands(prices),
    adx: new ADX({ high: prices.map(p => p * 1.001), low: prices.map(p => p * 0.999), close: prices, period: 14 })
      .getResult()[0],
    atr: new ATR({ high: prices.map(p => p * 1.001), low: prices.map(p => p * 0.999), close: prices, period: 14 })
      .getResult()[0],
    roc: calculateMomentum(prices)
  };
}