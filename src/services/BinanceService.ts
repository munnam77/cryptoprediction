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
    
    // Step 3: Build comprehensive market data
    const marketData: MarketData[] = [];
    
    // Process each ticker
    for (const ticker of filteredTickers) {
      // Find corresponding pair info
      const pairInfo = usdtPairs.find(pair => pair.symbol === ticker.symbol);
      if (!pairInfo) continue;
      
      // Get historical data for volatility calculation
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
        liquidity
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
  getComprehensiveMarketData,
  getTopGainers,
  getLowCapGems,
  getMarketMood
};

export default BinanceService;
