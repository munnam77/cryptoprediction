interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Pattern {
  type: string;
  confidence: number;
  description: string;
  action: 'buy' | 'sell' | 'neutral';
}

function isDoji(candle: CandleData): boolean {
  const bodySize = Math.abs(candle.open - candle.close);
  const wickSize = candle.high - candle.low;
  return bodySize / wickSize < 0.1;
}

function isHammer(candle: CandleData): boolean {
  const bodySize = Math.abs(candle.open - candle.close);
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  return lowerWick > bodySize * 2 && upperWick < bodySize * 0.5;
}

function isEngulfing(prev: CandleData, current: CandleData): boolean {
  const prevBody = Math.abs(prev.open - prev.close);
  const currentBody = Math.abs(current.open - current.close);
  return currentBody > prevBody * 1.5;
}

export function analyzeCandlePatterns(candles: CandleData[]): Pattern[] {
  const patterns: Pattern[] = [];
  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];

  if (isDoji(lastCandle)) {
    patterns.push({
      type: 'Doji',
      confidence: 75,
      description: 'Market indecision, potential trend reversal',
      action: 'neutral'
    });
  }

  if (isHammer(lastCandle)) {
    patterns.push({
      type: 'Hammer',
      confidence: 80,
      description: 'Potential bullish reversal pattern',
      action: 'buy'
    });
  }

  if (isEngulfing(prevCandle, lastCandle)) {
    const isBullish = lastCandle.close > lastCandle.open;
    patterns.push({
      type: `${isBullish ? 'Bullish' : 'Bearish'} Engulfing`,
      confidence: 85,
      description: `Strong ${isBullish ? 'bullish' : 'bearish'} reversal signal`,
      action: isBullish ? 'buy' : 'sell'
    });
  }

  return patterns;
}

export function analyzeVolume(candles: CandleData[]): Pattern[] {
  const patterns: Pattern[] = [];
  const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
  const lastVolume = candles[candles.length - 1].volume;

  if (lastVolume > avgVolume * 2) {
    patterns.push({
      type: 'Volume Spike',
      confidence: 70,
      description: 'Significant increase in trading activity',
      action: 'neutral'
    });
  }

  return patterns;
}

export function analyzeTrendPatterns(candles: CandleData[]): Pattern[] {
  const patterns: Pattern[] = [];
  const closes = candles.map(c => c.close);
  
  // Check for higher highs and higher lows (uptrend)
  let isUptrend = true;
  let isDowntrend = true;
  
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] <= closes[i - 1]) isUptrend = false;
    if (closes[i] >= closes[i - 1]) isDowntrend = false;
  }

  if (isUptrend) {
    patterns.push({
      type: 'Strong Uptrend',
      confidence: 90,
      description: 'Consistent higher highs and higher lows',
      action: 'buy'
    });
  }

  if (isDowntrend) {
    patterns.push({
      type: 'Strong Downtrend',
      confidence: 90,
      description: 'Consistent lower highs and lower lows',
      action: 'sell'
    });
  }

  return patterns;
}

export function analyzePatterns(candles: CandleData[]): Pattern[] {
  return [
    ...analyzeCandlePatterns(candles),
    ...analyzeVolume(candles),
    ...analyzeTrendPatterns(candles)
  ];
}