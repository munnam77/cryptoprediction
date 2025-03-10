/**
 * BinanceService.ts
 * Provides functions to interact with the Binance API for real cryptocurrency data
 */
import { API_CONFIG, WS_CONFIG, ENDPOINTS } from '../config/binance.config';
import type { BinanceTicker, BinanceSymbolInfo, BinanceKline, MarketData, TimeFrame } from '../types/binance';
import BinanceWebSocketManager from './BinanceWebSocketManager';

// Binance API base URL
const BINANCE_API_BASE = API_CONFIG.baseUrl + '/api/v3';
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Define BINANCE_CONFIG for backward compatibility
const BINANCE_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: API_CONFIG.rateLimits.requestsPerMinute,
  RETRY_DELAY: 5000,
  MINIMUM_VOLUME_24H: 100000,
  BLACKLISTED_PAIRS: ['USDC', 'BUSD', 'TUSD', 'PAX', 'USDS', 'DAI']
};

// Enhanced error handling and retry mechanism
const fetchWithRetry = async (url: string, options = {}, maxRetries = 3): Promise<any> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      retries++;
      console.warn(`API request failed (attempt ${retries}/${maxRetries}): ${error}`);
      
      if (retries >= maxRetries) {
        throw new Error(`Maximum retries reached: ${error}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, BINANCE_CONFIG.RETRY_DELAY * Math.pow(2, retries - 1)));
    }
  }
  
  // This should never be reached due to the throw in the last retry
  throw new Error("Failed to fetch after maximum retries");
};

// Rate limiting queue for API requests
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsThisMinute = 0;
  private resetTime = Date.now() + 60000;
  
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    
    // Reset counter if minute has passed
    if (Date.now() > this.resetTime) {
      this.requestsThisMinute = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    // Check if we've hit rate limit
    if (this.requestsThisMinute >= BINANCE_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = this.resetTime - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestsThisMinute = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      this.requestsThisMinute++;
      await nextRequest();
    }
    
    // Process next item in queue
    this.processQueue();
  }
}

const rateLimiter = new RateLimiter();

/**
 * Get all USDT trading pairs from Binance
 */
export const getUSDTPairs = async (): Promise<BinanceSymbolInfo[]> => {
  try {
    return await rateLimiter.add(async () => {
    const response = await fetch(`${BINANCE_API_BASE}/exchangeInfo`);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
      // Filter for USDT pairs only
    return data.symbols.filter((symbol: BinanceSymbolInfo) => 
      symbol.quoteAsset === 'USDT' && 
      symbol.status === 'TRADING' &&
      symbol.isSpotTradingAllowed &&
      !BINANCE_CONFIG.BLACKLISTED_PAIRS.includes(symbol.baseAsset)
    );
    });
  } catch (error) {
    console.error('API error:', error);
    return [];
  }
};

/**
 * Get 24hr ticker data for all symbols or a specific symbol
 */
export const get24hrTickers = async (symbol?: string): Promise<BinanceTicker[]> => {
  try {
    return await rateLimiter.add(async () => {
    const url = symbol 
      ? `${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}` 
      : `${BINANCE_API_BASE}/ticker/24hr`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Array.isArray(data) ? data : [data];
    });
  } catch (error) {
    console.error('API error:', error);
    return [];
  }
};

/**
 * Get historical klines (candlestick data)
 * @param symbol Trading pair symbol (e.g., "BTCUSDT")
 * @param interval Kline interval (e.g., "1h", "4h")
 * @param limit Number of klines to get
 */
export const getKlineData = async (
  symbol: string, 
  interval: string = '1h',
  limit: number = 100
): Promise<BinanceKline[]> => {
  try {
    return await rateLimiter.add(async () => {
    const url = `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
      return data.map((kline: any[]) => ({
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
    });
  } catch (error) {
    console.error('API error:', error);
    return [];
  }
};

/**
 * Get market cap data from CoinGecko
 * @param coinIds Array of CoinGecko coin IDs
 */
export const getMarketCapData = async (coinIds: string[]): Promise<Record<string, number>> => {
  try {
    return await rateLimiter.add(async () => {
    const ids = coinIds.join(',');
    const response = await fetch(
        `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${ids}&per_page=250`
    );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
    const data = await response.json();
    
      // Create a map of coin id to market cap
    const marketCaps: Record<string, number> = {};
    data.forEach((coin: any) => {
        marketCaps[coin.symbol.toUpperCase()] = coin.market_cap || 0;
    });
    
    return marketCaps;
    });
  } catch (error) {
    console.error('API error:', error);
    return {};
  }
};

/**
 * Calculate volatility from historical price data
 * @param klines Array of kline data
 */
export const calculateVolatility = (high: number, low: number, last: number): number => {
  // Calculate volatility as the percentage range between high and low
  // relative to the last price
  if (last === 0) return 0;
  
  const range = high - low;
  const volatility = (range / last) * 100;
  
  // Scale to 0-100
  return Math.min(100, Math.round(volatility * 5)); // Multiply by 5 to make it more visible
};

/**
 * Calculate liquidity score based on volume and bid/ask spread
 * @param ticker Ticker data with volume
 * @param volume Volume normalized to 0-100 scale
 */
export const calculateLiquidity = (volume: number): number => {
  // Simple liquidity score based on volume
  // Higher volume = higher liquidity (0-100 scale)
  const MIN_VOLUME = 10000;  // $10K daily volume is very low
  const MAX_VOLUME = 100000000;  // $100M daily volume is very high
  
  if (volume <= MIN_VOLUME) return 0;
  if (volume >= MAX_VOLUME) return 100;
  
  // Log scale to better represent the range
  const logVolume = Math.log(volume) - Math.log(MIN_VOLUME);
  const logMaxVolume = Math.log(MAX_VOLUME) - Math.log(MIN_VOLUME);
  
  return Math.round((logVolume / logMaxVolume) * 100);
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
  // Base probability starts at 50%
  let probability = 50;
  
  // Factor 1: Recent price change
  if (data.priceChangePercent > 5) {
    probability += 10; // Strong recent performance
  } else if (data.priceChangePercent > 2) {
    probability += 5; // Moderate recent performance
  } else if (data.priceChangePercent < -5) {
    probability -= 10; // Poor recent performance
  } else if (data.priceChangePercent < -2) {
    probability -= 5; // Moderate poor performance
  }
  
  // Factor 2: Volume change
  if (data.volumeChangePercent > 100) {
    probability += 15; // Massive volume increase
  } else if (data.volumeChangePercent > 50) {
    probability += 10; // Significant volume increase
  } else if (data.volumeChangePercent > 20) {
    probability += 5; // Moderate volume increase
  } else if (data.volumeChangePercent < -50) {
    probability -= 10; // Significant volume decrease
  }
  
  // Factor 3: Volatility
  if (data.volatility > 70) {
    probability += 10; // High volatility
  } else if (data.volatility > 50) {
    probability += 5; // Moderate volatility
  } else if (data.volatility < 20) {
    probability -= 5; // Low volatility
  }
  
  // Factor 4: Timeframe weight
  // Shorter timeframes are more volatile and less predictable
  switch (timeframe) {
    case '15m': 
      probability = probability * 0.8 + 10; // Less reliable, bias toward 50%
      break;
    case '30m':
      probability = probability * 0.85 + 7.5; // Slightly more reliable
      break;
    case '1h':
      probability = probability * 0.9 + 5; // More reliable
      break;
    case '4h':
      probability = probability * 0.95 + 2.5; // More reliable
      break;
    case '1d':
      // No adjustment for daily timeframe
      break;
  }
  
  // Ensure probability is within 0-100 range
  return Math.max(0, Math.min(100, probability));
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
): { price: number; type: 'resistance' | 'support'; time: number; } | undefined => {
  if (klines.length < 10) return undefined;
  
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
  
  return undefined;
};

/**
 * Get comprehensive market data for all USDT pairs
 * @param timeframe Timeframe for historical data
 */
export const getComprehensiveMarketData = async (timeframe: string = '1d'): Promise<MarketData[]> => {
  try {
    // Get all USDT trading pairs
    const pairs = await getUSDTPairs();
    
    // Get 24hr ticker data for all pairs
    const tickers = await get24hrTickers();
    
    // Map ticker data to trading pairs
    const marketData: MarketData[] = pairs.map(pair => {
      const ticker = tickers.find((t: BinanceTicker) => t.symbol === pair.symbol);
      
      if (!ticker) {
          return {
          symbol: pair.symbol,
          baseAsset: pair.baseAsset,
          quoteAsset: pair.quoteAsset,
          price: 0,
          priceChangePercent: 0,
          volume: 0,
          volumeChangePercent: 0,
          high24h: 0,
          low24h: 0,
          marketCap: 0,
          liquidity: 50,
          volatility: 50,
          prediction: 'neutral',
          confidence: 0
        };
      }
      
      return {
        symbol: pair.symbol,
        baseAsset: pair.baseAsset,
        quoteAsset: pair.quoteAsset,
        price: parseFloat(ticker.lastPrice),
        priceChangePercent: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume),
        volumeChangePercent: 0, // Will be calculated later
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        marketCap: 0, // Will be filled in later
        liquidity: calculateLiquidity(parseFloat(ticker.volume)),
        volatility: calculateVolatility(
          parseFloat(ticker.highPrice),
          parseFloat(ticker.lowPrice),
          parseFloat(ticker.lastPrice)
        ),
        prediction: 'neutral',
        confidence: 0
      };
    });
    
    // Filter out any pairs with zero price or volume
    return marketData.filter(data => data.price > 0 && data.volume > 0);
  } catch (error) {
    console.error('Error fetching comprehensive market data:', error);
    return [];
  }
};

// Helper functions to make the main function cleaner
const calculateVolumeChange = (klines: BinanceKline[]): number => {
  if (klines.length < 2) return 0;
  const currentVolume = parseFloat(klines[klines.length - 1].volume);
  const previousVolume = parseFloat(klines[klines.length - 2].volume);
  return previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : 0;
};

const calculateTrendDetails = (ticker: BinanceTicker) => {
  const priceChangePercent = parseFloat(ticker.priceChangePercent);
  let direction: 'up' | 'down' | 'sideways' = 'sideways';
  let strength = 0;

  if (priceChangePercent > 1) {
    direction = 'up';
    strength = Math.min(100, priceChangePercent * 5);
  } else if (priceChangePercent < -1) {
    direction = 'down';
    strength = Math.min(100, Math.abs(priceChangePercent) * 5);
  }

  return {
    direction,
    strength,
    duration: 0
  };
};

const calculateConsecutiveGains = (klines: BinanceKline[]): number => {
  return klines.slice(-5).filter((k, i, arr) => 
    i > 0 && parseFloat(k.close) > parseFloat(arr[i-1].close)
  ).length;
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
 * @param minMarketCap Minimum market cap for filtering
 * @param maxMarketCap Maximum market cap for filtering
 * @param limit Maximum number of results
 */
export const getLowCapGems = async (
  timeframe: string = '1d',
  minMarketCap: number = 10000000, // $10M
  maxMarketCap: number = 500000000, // $500M
  limit: number = 10
): Promise<MarketData[]> => {
  try {
    const allMarketData = await getComprehensiveMarketData(timeframe);
    
    // Get market cap data for all pairs
    const baseAssets = allMarketData.map(data => data.baseAsset.toLowerCase());
    const marketCapData = await getMarketCapData(baseAssets);
    
    // Add market cap data to market data
    const withMarketCap = allMarketData.map(data => {
      const marketCap = marketCapData[data.baseAsset.toUpperCase()] || 0;
    return {
      ...data,
        marketCap
    };
  });
  
    // Filter by market cap range
    const filteredByMarketCap = withMarketCap.filter(
      data => data.marketCap >= minMarketCap && data.marketCap <= maxMarketCap
    );
    
    // Sort by potential (combination of volatility, volume change, and price change)
    const sorted = [...filteredByMarketCap].sort((a, b) => {
      const aVolatility = a.volatility || 0;
      const bVolatility = b.volatility || 0;
      const aVolumeChange = a.volumeChangePercent || 0;
      const bVolumeChange = b.volumeChangePercent || 0;
      const aPriceChange = a.priceChangePercent || 0;
      const bPriceChange = b.priceChangePercent || 0;
      
      const aPotential = (aVolatility * 0.4) + (Math.abs(aVolumeChange) * 0.3) + (Math.abs(aPriceChange) * 0.3);
      const bPotential = (bVolatility * 0.4) + (Math.abs(bVolumeChange) * 0.3) + (Math.abs(bPriceChange) * 0.3);
      return bPotential - aPotential;
    });
    
    // Return top N low cap gems
    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error getting low cap gems:', error);
    return [];
  }
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
    console.error('API error:', error);
    return {
      sentiment: 50,  // Neutral fallback
      btcChangePercent: 0,
      marketChangePercent: 0,
      volatility: 30
    };
  }
};

// Add real-time data handling methods
/**
 * Subscribe to real-time market data updates
 * @param symbols Array of trading pairs to subscribe to
 * @param onUpdate Callback function for data updates
 */
export const subscribeToMarketData = (
  symbols: string[],
  onUpdate: (data: MarketData[]) => void
): void => {
  // Use the WebSocket manager to subscribe to ticker updates
  const wsManager = BinanceWebSocketManager.getInstance();
  
  // Create a buffer to collect updates
  const dataBuffer: any[] = [];
  let bufferTimer: NodeJS.Timeout | null = null;
  
  wsManager.subscribeToTickerUpdates(symbols, (tickerData: any) => {
    // Add the data to the buffer
    dataBuffer.push(tickerData);
    
    // If we have a timer already, clear it
    if (bufferTimer) {
      clearTimeout(bufferTimer);
    }
    
    // Set a new timer to process the buffer after a short delay
    // This helps batch updates together for better performance
    bufferTimer = setTimeout(() => {
      if (dataBuffer.length === 0) return;
      
      try {
        // Convert ticker data to MarketData format
        const marketData: MarketData[] = dataBuffer.map(ticker => {
          const symbol = ticker.s;
          const baseAsset = symbol.replace('USDT', '');
          const quoteAsset = 'USDT';
        
        return {
            symbol,
            baseAsset,
            quoteAsset,
            price: parseFloat(ticker.c),
            priceChangePercent: parseFloat(ticker.P),
            volume: parseFloat(ticker.v),
            volumeChangePercent: 0, // Real-time data doesn't include this
            high24h: parseFloat(ticker.h),
            low24h: parseFloat(ticker.l),
            marketCap: 0, // Real-time data doesn't include this
            liquidity: calculateLiquidity(parseFloat(ticker.v)),
            volatility: calculateVolatility(
              parseFloat(ticker.h),
              parseFloat(ticker.l),
              parseFloat(ticker.c)
            ),
            prediction: 'neutral',
            confidence: 0
          };
        });
        
        // Clear the buffer
        dataBuffer.length = 0;
        
        // Notify the callback
        onUpdate(marketData);
    } catch (error) {
      console.error("Error processing real-time market data:", error);
        // Return empty array on error
        onUpdate([]);
      }
    }, 100); // 100ms delay to batch updates
  });
};

/**
 * Unsubscribe from market data updates
 */
export const unsubscribeFromMarketData = (): void => {
  const wsManager = BinanceWebSocketManager.getInstance();
  wsManager.unsubscribeAll();
};

// Export the entire service
const BinanceService = {
  getUSDTPairs,
  get24hrTickers,
  getKlineData,
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
  getMarketMood,
  subscribeToMarketData,
  unsubscribeFromMarketData
};

export default BinanceService;
