/**
 * BinanceService.ts
 * Provides functions to interact with the Binance API for real cryptocurrency data
 */

// Types for Binance API responses
export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface BinanceSymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  quoteAssetPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: any[];
  permissions: string[];
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  trades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface MarketData {
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
  // Break alerts
  breakout?: {
    price: number;
    type: 'resistance' | 'support';
    time: number;
  };
  // Trend data
  trend?: {
    direction: 'up' | 'down' | 'sideways';
    strength: number; // 0-100
    duration: number; // In minutes
  };
  // Support/Resistance pivot points
  pivotPoint?: {
    price: number;
    type: 'support' | 'resistance';
    strength: number; // 0-100
  };
  // Order book imbalance
  orderBookImbalance?: number; // 0-100, higher means more buy orders
  // Trading zones for hot zone visualization
  tradingZones?: {
    price: number;
    intensity: number; // 0-100
  }[];
  // RSI value
  rsi?: number; // 0-100
  // BTC correlation
  btcCorrelation?: number; // -100 to 100
  // Pump probability
  pumpProbability?: number; // 0-100
  // Price velocity
  priceVelocity?: number; // Price change per second
  priceVelocityTrend?: 'accelerating' | 'decelerating' | 'stable';
  // Profit target
  profitTarget?: number; // Percentage
  // For Whale Tail icon feature
  whaleActivity?: {
    action: 'buy' | 'sell';
    amount: number;
    time: number;
  };
  // For historical prediction accuracy
  previousPrediction?: {
    priceTarget: number;
    confidence: number;
    timestamp: number;
    actualOutcome: number;
  };
  // For streak counter
  consecutiveGains?: number;
  // Add gemScore for low cap gems calculation
  gemScore?: number;
}

// Binance API base URL
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// CoinGecko API for market cap data
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Get all USDT trading pairs from Binance
 */
export const getUSDTPairs = async (): Promise<BinanceSymbolInfo[]> => {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/exchangeInfo`);
    const data = await response.json();
    
    // Filter for active USDT pairs
    return data.symbols.filter((symbol: BinanceSymbolInfo) => 
      symbol.quoteAsset === 'USDT' && 
      symbol.status === 'TRADING' &&
      symbol.isSpotTradingAllowed
    );
  } catch (error) {
    console.error('Error fetching USDT pairs:', error);
    return [];
  }
};

/**
 * Get 24hr ticker data for all symbols or a specific symbol
 */
export const get24hrTickers = async (symbol?: string): Promise<BinanceTicker[]> => {
  try {
    const url = symbol 
      ? `${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}` 
      : `${BINANCE_API_BASE}/ticker/24hr`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching 24hr tickers:', error);
    return [];
  }
};

/**
 * Get historical klines (candlestick data)
 * @param symbol Trading pair symbol (e.g., "BTCUSDT")
 * @param interval Kline interval (e.g., "1h", "4h")
 * @param limit Number of klines to get
 */
export const getKlines = async (
  symbol: string, 
  interval: '15m' | '30m' | '1h' | '4h' | '1d', 
  limit: number = 100
): Promise<BinanceKline[]> => {
  try {
    const response = await fetch(
      `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    const data = await response.json();
    
    // Transform raw kline data to the expected format
    return data.map((kline: any): BinanceKline => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteAssetVolume: kline[7],
      trades: kline[8],
      takerBuyBaseAssetVolume: kline[9],
      takerBuyQuoteAssetVolume: kline[10]
    }));
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error);
    return [];
  }
};

/**
 * Get market cap data from CoinGecko
 * @param coinIds Array of CoinGecko coin IDs
 */
export const getMarketCapData = async (coinIds: string[]): Promise<Record<string, number>> => {
  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${ids}&per_page=250&page=1&sparkline=false`
    );
    const data = await response.json();
    
    // Create a map of coinId to market cap
    const marketCaps: Record<string, number> = {};
    data.forEach((coin: any) => {
      marketCaps[coin.symbol.toUpperCase()] = coin.market_cap;
    });
    
    return marketCaps;
  } catch (error) {
    console.error('Error fetching market cap data:', error);
    return {};
  }
};

/**
 * Calculate volatility from historical price data
 * @param klines Array of kline data
 */
export const calculateVolatility = (klines: BinanceKline[]): number => {
  if (klines.length < 2) return 0;
  
  // Calculate percent changes between closing prices
  const changes: number[] = [];
  for (let i = 1; i < klines.length; i++) {
    const prevClose = parseFloat(klines[i-1].close);
    const currClose = parseFloat(klines[i].close);
    const change = ((currClose - prevClose) / prevClose) * 100;
    changes.push(change);
  }
  
  // Calculate standard deviation of price changes
  const mean = changes.reduce((sum, value) => sum + value, 0) / changes.length;
  const squaredDiffs = changes.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize to a 0-100 scale (assuming max volatility around 10% stdDev)
  return Math.min(100, Math.max(0, stdDev * 10));
};

/**
 * Calculate liquidity score based on volume and bid/ask spread
 * @param ticker Ticker data with volume
 * @param normalizedVolume Volume normalized to 0-100 scale
 */
export const calculateLiquidity = (ticker: BinanceTicker, normalizedVolume: number): number => {
  const bidPrice = parseFloat(ticker.bidPrice);
  const askPrice = parseFloat(ticker.askPrice);
  
  // Calculate bid-ask spread as a percentage
  const spread = (askPrice - bidPrice) / askPrice * 100;
  
  // Invert spread (lower spread = higher liquidity)
  // Normalize to 0-100 scale (assuming max acceptable spread is 2%)
  const spreadScore = Math.min(100, Math.max(0, 100 - (spread * 50)));
  
  // Combine volume and spread scores (weighted)
  return spreadScore * 0.7 + normalizedVolume * 0.3;
};

/**
 * Calculate RSI (Relative Strength Index)
 * @param klines Array of kline data
 * @param period RSI period (default: 14)
 */
export const calculateRSI = (klines: BinanceKline[], period: number = 14): number => {
  if (klines.length < period + 1) return 50; // Not enough data
  
  // Get closing prices
  const closes = klines.map(k => parseFloat(k.close));
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  
  // Use only the required periods for calculation
  const changesForPeriod = changes.slice(changes.length - period);
  
  // Separate gains and losses
  const gains = changesForPeriod.map(change => change > 0 ? change : 0);
  const losses = changesForPeriod.map(change => change < 0 ? Math.abs(change) : 0);
  
  // Calculate average gain and loss
  const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
  
  // Calculate RS and RSI
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
};

/**
 * Calculate correlation between asset and BTC
 * @param assetKlines Historical data for asset
 * @param btcKlines Historical data for BTC
 */
export const calculateCorrelation = (assetKlines: BinanceKline[], btcKlines: BinanceKline[]): number => {
  // Need at least 10 data points for meaningful correlation
  if (assetKlines.length < 10 || btcKlines.length < 10) return 0;
  
  // Match timestamps and get closing prices
  const matchedData: {assetClose: number, btcClose: number}[] = [];
  
  assetKlines.forEach(assetKline => {
    // Find matching BTC kline with same open time
    const matchingBtcKline = btcKlines.find(
      btcKline => btcKline.openTime === assetKline.openTime
    );
    
    if (matchingBtcKline) {
      matchedData.push({
        assetClose: parseFloat(assetKline.close),
        btcClose: parseFloat(matchingBtcKline.close)
      });
    }
  });
  
  // Need at least a few matched points
  if (matchedData.length < 5) return 0;
  
  // Calculate price percentage changes
  const assetChanges: number[] = [];
  const btcChanges: number[] = [];
  
  for (let i = 1; i < matchedData.length; i++) {
    const assetChange = (matchedData[i].assetClose - matchedData[i-1].assetClose) / 
                       matchedData[i-1].assetClose * 100;
    const btcChange = (matchedData[i].btcClose - matchedData[i-1].btcClose) / 
                     matchedData[i-1].btcClose * 100;
    
    assetChanges.push(assetChange);
    btcChanges.push(btcChange);
  }
  
  // Calculate correlation coefficient
  const meanAsset = assetChanges.reduce((sum, val) => sum + val, 0) / assetChanges.length;
  const meanBtc = btcChanges.reduce((sum, val) => sum + val, 0) / btcChanges.length;
  
  let numerator = 0;
  let denomAsset = 0;
  let denomBtc = 0;
  
  for (let i = 0; i < assetChanges.length; i++) {
    const assetDiff = assetChanges[i] - meanAsset;
    const btcDiff = btcChanges[i] - meanBtc;
    
    numerator += assetDiff * btcDiff;
    denomAsset += assetDiff * assetDiff;
    denomBtc += btcDiff * btcDiff;
  }
  
  const denominator = Math.sqrt(denomAsset * denomBtc);
  if (denominator === 0) return 0;
  
  // Return correlation coefficient (-1 to 1) scaled to -100 to 100
  return Math.round((numerator / denominator) * 100);
};

/**
 * Calculate price change velocity
 * @param klines Recent kline data
 * @returns Price change per second
 */
export const calculatePriceVelocity = (klines: BinanceKline[]): {
  velocity: number,
  trend: 'accelerating' | 'decelerating' | 'stable'
} => {
  if (klines.length < 3) {
    return { velocity: 0, trend: 'stable' };
  }
  
  // Get last three candles for trend analysis
  const recentKlines = klines.slice(klines.length - 3);
  
  // Calculate price changes for recent candles
  const changes: number[] = [];
  for (let i = 1; i < recentKlines.length; i++) {
    const prevClose = parseFloat(recentKlines[i-1].close);
    const currClose = parseFloat(recentKlines[i].close);
    const timeSpan = (recentKlines[i].closeTime - recentKlines[i].openTime) / 1000; // in seconds
    
    const changePerSecond = ((currClose - prevClose) / prevClose) / timeSpan;
    changes.push(changePerSecond);
  }
  
  // Latest velocity (most recent change)
  const velocity = changes[changes.length - 1];
  
  // Determine trend by comparing recent changes
  let trend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
  
  if (changes.length >= 2) {
    const currentVelocity = Math.abs(changes[1]);
    const previousVelocity = Math.abs(changes[0]);
    
    if (currentVelocity > previousVelocity * 1.1) {
      trend = 'accelerating';
    } else if (currentVelocity < previousVelocity * 0.9) {
      trend = 'decelerating';
    }
  }
  
  // Return velocity in price change percentage per second
  // Multiply by 10000 to get a more readable number
  return {
    velocity: velocity * 10000,
    trend
  };
};

/**
 * Calculate pump probability
 * @param data Market data
 * @param timeframe Current timeframe
 */
export const calculatePumpProbability = (
  data: MarketData,
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d'
): number => {
  if (!data.historicalData || data.historicalData.length < 10) {
    return 0;
  }
  
  // Factors affecting pump probability
  const volumeFactor = Math.min(100, data.volumeChangePercent * 2);
  const volatilityFactor = data.volatility || 0;
  const trendFactor = data.trend?.direction === 'up' ? data.trend.strength : 0;
  const rsi = calculateRSI(data.historicalData);
  const rsiBonus = rsi < 40 ? (40 - rsi) : 0; // Lower RSI means oversold, higher pump chance
  
  // Calculate base probability
  let pumpProb = Math.max(0,
    volumeFactor * 0.4 +
    volatilityFactor * 0.3 + 
    trendFactor * 0.2 +
    rsiBonus
  );
  
  // Adjust based on timeframe
  switch(timeframe) {
    case '15m': 
      // 15m is more volatile/unpredictable
      pumpProb = pumpProb * 0.8 + Math.random() * 20;
      break;
    case '30m':
      // 30m is slightly more predictable
      pumpProb = pumpProb * 0.85 + Math.random() * 15;
      break;
    case '1h':
      // 1h is moderate
      pumpProb = pumpProb * 0.9 + Math.random() * 10;
      break;
    case '4h':
      // 4h is more reliable
      pumpProb = pumpProb * 0.95 + Math.random() * 5;
      break;
    case '1d':
      // 1d is most reliable
      break;
  }
  
  return Math.min(100, Math.max(0, Math.round(pumpProb)));
};

/**
 * Calculate profit target based on volatility and timeframe
 * @param volatility Volatility score (0-100)
 * @param timeframe Current timeframe
 */
export const calculateProfitTarget = (
  volatility: number,
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d'
): number => {
  // Base profit expectation
  let baseProfit = volatility / 10; // 0-10%
  
  // Adjust based on timeframe
  switch(timeframe) {
    case '15m': baseProfit = baseProfit * 0.5; break; // Lower in short timeframes
    case '30m': baseProfit = baseProfit * 0.6; break;
    case '1h': baseProfit = baseProfit * 0.8; break;
    case '4h': baseProfit = baseProfit * 1.2; break; // Higher in longer timeframes
    case '1d': baseProfit = baseProfit * 1.5; break;
  }
  
  return Math.max(1, Math.min(30, Math.round(baseProfit))); // Range: 1-30%
};

/**
 * Detect support/resistance breakouts
 * @param klines Historical kline data
 * @param currentPrice Current price
 */
export const detectBreakouts = (
  klines: BinanceKline[],
  currentPrice: number
): { price: number; type: 'resistance' | 'support'; time: number } | null => {
  if (klines.length < 10) return null;
  
  // Find recent highs and lows
  const recentHigh = Math.max(...klines.slice(-10).map(k => parseFloat(k.high)));
  const recentLow = Math.min(...klines.slice(-10).map(k => parseFloat(k.low)));
  
  // Calculate average candle size
  const avgCandleSize = klines.slice(-10).reduce(
    (sum, k) => sum + (parseFloat(k.high) - parseFloat(k.low)), 
    0
  ) / 10;
  
  // Check for breakouts (price should break by at least 1/3 avg candle size)
  const breakoutThreshold = avgCandleSize / 3;
  
  if (currentPrice > recentHigh + breakoutThreshold) {
    return {
      price: recentHigh,
      type: 'resistance',
      time: Date.now()
    };
  }
  
  if (currentPrice < recentLow - breakoutThreshold) {
    return {
      price: recentLow,
      type: 'support',
      time: Date.now()
    };
  }
  
  return null;
};

/**
 * Get comprehensive market data for all USDT pairs
 * @param timeframe Timeframe for historical data
 */
export const getComprehensiveMarketData = async (
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d' = '1h'
): Promise<MarketData[]> => {
  try {
    // Step 1: Get all USDT trading pairs
    const usdtPairs = await getUSDTPairs();
    
    // Step 2: Get 24hr ticker data for all pairs
    const tickers = await get24hrTickers();
    
    // Filter for tickers that match our USDT pairs
    const filteredTickers = tickers.filter(ticker => 
      usdtPairs.some(pair => pair.symbol === ticker.symbol)
    );
    
    // Find maximum volume to normalize liquidity scores
    const maxVolume = Math.max(...filteredTickers.map(ticker => parseFloat(ticker.quoteVolume)));
    
    // Get BTC historical data for correlation
    const btcKlines = await getKlines('BTCUSDT', timeframe, 20);
    
    // Step 3: Build comprehensive market data
    const marketData: MarketData[] = [];
    
    // Process each ticker
    for (const ticker of filteredTickers) {
      // Find corresponding pair info
      const pairInfo = usdtPairs.find(pair => pair.symbol === ticker.symbol);
      if (!pairInfo) continue;
      
      // Get historical data for calculations
      const klines = await getKlines(ticker.symbol, timeframe, 20);
      
      // Calculate volatility
      const volatility = calculateVolatility(klines);
      
      // Calculate volume change percent from historical data
      let volumeChangePercent = 0;
      if (klines.length >= 2) {
        const currentVolume = parseFloat(klines[klines.length - 1].volume);
        const previousVolume = parseFloat(klines[klines.length - 2].volume);
        volumeChangePercent = previousVolume > 0 
          ? ((currentVolume - previousVolume) / previousVolume) * 100 
          : 0;
      }
      
      // Calculate normalized volume (0-100)
      const normalizedVolume = Math.min(100, 
        (parseFloat(ticker.quoteVolume) / maxVolume) * 100
      );
      
      // Calculate liquidity score
      const liquidity = calculateLiquidity(ticker, normalizedVolume);
      
      // Calculate RSI
      const rsi = calculateRSI(klines);
      
      // Calculate BTC correlation
      const btcCorrelation = calculateCorrelation(klines, btcKlines);
      
      // Calculate price velocity
      const {velocity, trend} = calculatePriceVelocity(klines);
      
      // Calculate pump probability
      const pumpProbability = calculatePumpProbability({
        symbol: ticker.symbol,
        baseAsset: pairInfo.baseAsset,
        quoteAsset: pairInfo.quoteAsset,
        price: parseFloat(ticker.lastPrice),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.quoteVolume),
        volumeChangePercent,
        historicalData: klines,
        volatility,
        liquidity
      }, timeframe);
      
      // Calculate profit target
      const profitTarget = calculateProfitTarget(volatility, timeframe);
      
      // Detect breakouts
      const breakout = detectBreakouts(klines, parseFloat(ticker.lastPrice));
      
      // Determine trend direction and strength
      let trend = {
        direction: 'sideways' as 'up' | 'down' | 'sideways',
        strength: 0,
        duration: 0
      };
      
      if (parseFloat(ticker.priceChangePercent) > 1) {
        trend.direction = 'up';
        trend.strength = Math.min(100, parseFloat(ticker.priceChangePercent) * 5);
      } else if (parseFloat(ticker.priceChangePercent) < -1) {
        trend.direction = 'down';
        trend.strength = Math.min(100, Math.abs(parseFloat(ticker.priceChangePercent)) * 5);
      }
      
      // Create market data entry
      marketData.push({
        symbol: ticker.symbol,
        baseAsset: pairInfo.baseAsset,
        quoteAsset: pairInfo.quoteAsset,
        price: parseFloat(ticker.lastPrice),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.quoteVolume),
        volumeChangePercent,
        historicalData: klines,
        volatility,
        liquidity,
        rsi,
        btcCorrelation,
        priceVelocity: velocity,
        priceVelocityTrend: trend,
        pumpProbability,
        profitTarget,
        breakout,
        trend,
        // Add a basic pivot point for visualization
        pivotPoint: {
          price: (parseFloat(ticker.highPrice) + parseFloat(ticker.lowPrice)) / 2,
          type: parseFloat(ticker.priceChangePercent) > 0 ? 'support' : 'resistance',
          strength: Math.abs(parseFloat(ticker.priceChangePercent)) * 10
        },
        // Add order book imbalance (simplified without actual order book data)
        orderBookImbalance: 50 + (parseFloat(ticker.priceChangePercent) * 2),
        // Basic trading zones
        tradingZones: [
          { price: parseFloat(ticker.lowPrice), intensity: 70 },
          { price: parseFloat(ticker.highPrice), intensity: 60 }
        ],
        // Count consecutive gains from historical data
        consecutiveGains: klines.slice(-5).filter((k, i, arr) => 
          i > 0 && parseFloat(k.close) > parseFloat(arr[i-1].close)
        ).length
      });
    }
    
    // Sort by volume (descending)
    return marketData.sort((a, b) => b.volume - a.volume);
  } catch (error) {
    console.error('Error fetching comprehensive market data:', error);
    return [];
  }
};

/**
 * Get top gainers for a specific timeframe
 * @param timeframe Timeframe for historical data
 * @param limit Maximum number of results
 */
export const getTopGainers = async (
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d' = '1h',
  limit: number = 10
): Promise<MarketData[]> => {
  const marketData = await getComprehensiveMarketData(timeframe);
  
  // Filter out large market cap coins (approximated by high volume)
  // and sort by price change (descending)
  return marketData
    .filter(data => data.priceChangePercent > 0)
    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    .slice(0, limit);
};

/**
 * Get low-cap gems based on volatility and recent performance
 * @param timeframe Timeframe for historical data
 * @param limit Maximum number of results
 */
export const getLowCapGems = async (
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d' = '1h',
  limit: number = 10
): Promise<MarketData[]> => {
  const marketData = await getComprehensiveMarketData(timeframe);
  
  // Calculate a combined score for each coin
  const scoredData = marketData.map(data => {
    // Prioritize coins with:
    // - Higher volatility
    // - Positive price change
    // - Lower volume (as proxy for lower market cap)
    // - Higher volume change (indicating growing interest)
    
    const volatilityScore = data.volatility || 0;
    const priceChangeScore = Math.max(0, data.priceChangePercent * 2);
    const volumeScore = Math.max(0, data.volumeChangePercent);
    
    // Volume is inverted - we want lower volume coins
    const volumePenalty = Math.min(50, (data.volume / 1000000));
    
    const totalScore = 
      (volatilityScore * 0.4) + 
      (priceChangeScore * 0.3) + 
      (volumeScore * 0.3) - 
      volumePenalty;
    
    return {
      ...data,
      gemScore: totalScore
    };
  });
  
  // Sort by total score (descending)
  return scoredData
    .sort((a, b) => (b.gemScore || 0) - (a.gemScore || 0))
    .slice(0, limit);
};

/**
 * Get market mood based on overall market performance
 * Returns a value between 0-100, where:
 * - 0-33: Bearish
 * - 34-66: Neutral
 * - 67-100: Bullish
 */
export const getMarketMood = async (): Promise<{
  sentiment: number;
  btcChangePercent: number;
  marketChangePercent: number;
  volatility: number;
}> => {
  try {
    // Get BTC performance
    const btcTicker = await get24hrTickers('BTCUSDT');
    const btcChangePercent = parseFloat(btcTicker[0]?.priceChangePercent || '0');
    
    // Get market-wide performance
    const tickers = await get24hrTickers();
    const usdtTickers = tickers.filter(ticker => ticker.symbol.endsWith('USDT'));
    
    // Calculate average price change
    const totalChange = usdtTickers.reduce(
      (sum, ticker) => sum + parseFloat(ticker.priceChangePercent), 
      0
    );
    const marketChangePercent = totalChange / usdtTickers.length;
    
    // Calculate market-wide volatility
    const volatilityScores = usdtTickers.map(ticker => {
      const high = parseFloat(ticker.highPrice);
      const low = parseFloat(ticker.lowPrice);
      const avg = (high + low) / 2;
      return avg > 0 ? ((high - low) / avg) * 100 : 0;
    });
    
    const avgVolatility = volatilityScores.reduce((sum, score) => sum + score, 0) / 
      volatilityScores.length;
    
    // Normalize volatility to 0-100
    const normalizedVolatility = Math.min(100, avgVolatility * 10);
    
    // Calculate sentiment score (0-100)
    // Weightings: BTC 40%, Market 40%, Volatility 20%
    let sentiment = 
      (btcChangePercent * 4) +  // BTC has more impact
      (marketChangePercent * 3) +  // General market has impact
      50;  // Starting at neutral (50)
    
    // Adjust for volatility (high volatility reduces sentiment in bear markets, increases in bull)
    if (btcChangePercent < 0) {
      sentiment -= normalizedVolatility * 0.2;
    } else {
      sentiment += normalizedVolatility * 0.1;
    }
    
    // Ensure sentiment is within 0-100 range
    sentiment = Math.min(100, Math.max(0, sentiment));
    
    return {
      sentiment,
      btcChangePercent,
      marketChangePercent,
      volatility: normalizedVolatility
    };
  } catch (error) {
    console.error('Error calculating market mood:', error);
    return {
      sentiment: 50,  // Neutral fallback
      btcChangePercent: 0,
      marketChangePercent: 0,
      volatility: 30
    };
  }
};

// Export the entire service
const BinanceService = {
  getUSDTPairs,
  get24hrTickers,
  getKlines,
  getMarketCapData,
  calculateVolatility,
  calculateLiquidity,
  calculateRSI,
  calculateCorrelation,
  calculatePriceVelocity,
  calculatePumpProbability,
  calculateProfitTarget,
  detectBreakouts,
  getComprehensiveMarketData,
  getTopGainers,
  getLowCapGems,
  getMarketMood
};

export default BinanceService;
