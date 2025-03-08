/**
 * Mock BinanceService implementation for development
 * This version generates fake data instead of making real API calls
 */

export class BinanceService {
  private static marketDataCache: Map<string, any> = new Map();
  private static topMarketCapCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'USDC', 'STETH', 'DOGE', 'ADA', 'TRON'];
  
  /**
   * Get list of trading pairs excluding top market cap coins
   */
  static async getTradingPairs(): Promise<string[]> {
    // Return mock trading pairs
    return [
      'ADA/USDT',
      'SOL/USDT',
      'XRP/USDT',
      'DOT/USDT',
      'MATIC/USDT',
      'LINK/USDT',
      'LTC/USDT',
      'AVAX/USDT',
      'ATOM/USDT',
      'UNI/USDT',
      'ICP/USDT',
      'FIL/USDT',
      'NEAR/USDT',
      'APE/USDT'
    ];
  }
  
  /**
   * Get market data for a trading pair
   * @param tradingPair Trading pair (e.g., "SOL/USDT")
   */
  static async getMarketData(tradingPair: string) {
    try {
      // Convert from "SOL/USDT" format to "SOLUSDT" for Binance API
      const symbol = tradingPair.replace('/', '');
      
      // Check cache first
      const cacheKey = `market_${symbol}`;
      const cachedData = this.marketDataCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedData && now - cachedData.timestamp < 30000) {
        return cachedData.data;
      }
      
      // Generate mock data
      const baseAsset = symbol.replace('USDT', '');
      const price = this.generateMockPrice(baseAsset);
      const volume = this.generateMockVolume();
      
      // Generate mock market cap
      const marketCap = this.generateMockMarketCap(baseAsset);
      
      // Construct market data
      const marketData = {
        tradingPair,
        symbol,
        price,
        volume,
        priceChange24h: this.generateMockPriceChange(),
        high24h: price * (1 + Math.random() * 0.05),
        low24h: price * (1 - Math.random() * 0.05),
        marketCap,
        timestamp: now
      };
      
      // Cache the data
      this.marketDataCache.set(cacheKey, {
        data: marketData,
        timestamp: now
      });
      
      return marketData;
    } catch (error) {
      console.error(`Error generating mock market data for ${tradingPair}:`, error);
      return null;
    }
  }
  
  /**
   * Get historical kline data for a specific timeframe
   * @param tradingPair Trading pair (e.g., "SOL/USDT")
   * @param timeframe Timeframe to get data for 
   * @param limit Number of data points to return
   */
  static async getKlineData(tradingPair: string, timeframe: string, limit: number = 100) {
    try {
      // Generate mock kline data
      const klines = [];
      const basePrice = this.generateMockPrice(tradingPair.split('/')[0]);
      
      let currentTime = Date.now() - (limit * this.getTimeframeInMs(timeframe));
      
      for (let i = 0; i < limit; i++) {
        const open = basePrice * (0.95 + Math.random() * 0.1);
        const close = open * (0.98 + Math.random() * 0.04);
        const high = Math.max(open, close) * (1 + Math.random() * 0.03);
        const low = Math.min(open, close) * (1 - Math.random() * 0.03);
        const volume = this.generateMockVolume();
        
        klines.push({
          openTime: currentTime,
          open: open,
          high: high,
          low: low,
          close: close,
          volume: volume,
          closeTime: currentTime + this.getTimeframeInMs(timeframe),
          quoteAssetVolume: volume * close,
          numberOfTrades: Math.floor(100 + Math.random() * 900),
          takerBuyBaseAssetVolume: volume * 0.6,
          takerBuyQuoteAssetVolume: volume * close * 0.6,
        });
        
        currentTime += this.getTimeframeInMs(timeframe);
      }
      
      return klines;
    } catch (error) {
      console.error(`Error generating mock kline data for ${tradingPair}:`, error);
      return [];
    }
  }
  
  /**
   * Helper functions for generating mock data
   */
  private static generateMockPrice(symbol: string): number {
    // Generate realistic mock prices based on the asset
    const priceMap: Record<string, number> = {
      'BTC': 60000 + (Math.random() * 10000 - 5000),
      'ETH': 3000 + (Math.random() * 500 - 250),
      'BNB': 350 + (Math.random() * 50 - 25),
      'SOL': 130 + (Math.random() * 20 - 10),
      'XRP': 0.5 + (Math.random() * 0.1 - 0.05),
      'ADA': 0.4 + (Math.random() * 0.08 - 0.04),
      'DOT': 5 + (Math.random() * 1 - 0.5),
      'MATIC': 0.7 + (Math.random() * 0.1 - 0.05),
      'LINK': 12 + (Math.random() * 2 - 1),
      'LTC': 65 + (Math.random() * 10 - 5),
      'AVAX': 25 + (Math.random() * 5 - 2.5),
      'ATOM': 8 + (Math.random() * 1.5 - 0.75),
      'UNI': 4 + (Math.random() * 0.8 - 0.4),
      'ICP': 9 + (Math.random() * 1.8 - 0.9),
      'FIL': 3 + (Math.random() * 0.6 - 0.3),
      'NEAR': 1.5 + (Math.random() * 0.3 - 0.15),
      'APE': 1.2 + (Math.random() * 0.2 - 0.1),
    };
    
    return priceMap[symbol] || (Math.random() * 10 + 1); // Default price between $1-$11
  }
  
  private static generateMockVolume(): number {
    // Generate 24h volume between $1M and $100M
    return Math.random() * 99000000 + 1000000;
  }
  
  private static generateMockPriceChange(): number {
    // Generate price change percentage between -10% and +10%
    return Math.random() * 20 - 10;
  }
  
  private static generateMockMarketCap(symbol: string): number {
    // Generate realistic mock market caps based on the asset
    const marketCapMap: Record<string, number> = {
      'BTC': 1000000000000 + (Math.random() * 200000000000),
      'ETH': 350000000000 + (Math.random() * 50000000000),
      'BNB': 50000000000 + (Math.random() * 10000000000),
      'SOL': 50000000000 + (Math.random() * 10000000000),
      'XRP': 25000000000 + (Math.random() * 5000000000),
      'ADA': 12000000000 + (Math.random() * 2000000000),
      'DOT': 6000000000 + (Math.random() * 1000000000),
      'MATIC': 5000000000 + (Math.random() * 1000000000),
      'LINK': 4000000000 + (Math.random() * 1000000000),
      'LTC': 4000000000 + (Math.random() * 1000000000),
      'AVAX': 8000000000 + (Math.random() * 1000000000),
      'ATOM': 2000000000 + (Math.random() * 500000000),
      'UNI': 3000000000 + (Math.random() * 500000000),
      'ICP': 2000000000 + (Math.random() * 500000000),
      'FIL': 1500000000 + (Math.random() * 300000000),
      'NEAR': 1000000000 + (Math.random() * 300000000),
      'APE': 900000000 + (Math.random() * 200000000),
    };
    
    if (marketCapMap[symbol]) {
      return marketCapMap[symbol];
    } else {
      // Generate a random market cap for unknown tokens between $10M and $500M
      return Math.random() * 490000000 + 10000000;
    }
  }
  
  private static getTimeframeInMs(timeframe: string): number {
    const timeframeMap: Record<string, number> = {
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };
    
    return timeframeMap[timeframe] || 60 * 60 * 1000; // Default to 1h
  }
  
  static async calculateAllTimeframeMetrics(tradingPair: string) {
    // Simulate calculation of metrics for all timeframes
    const timeframes = ['15m', '30m', '1h', '4h', '1d'];
    const results: Record<string, any> = {};
    
    for (const timeframe of timeframes) {
      results[timeframe] = {
        price_change_pct: this.generateMockPriceChange(),
        volume_change_pct: this.generateMockPriceChange() * 2,
        volatility_score: Math.floor(Math.random() * 100),
        liquidity_score: Math.floor(Math.random() * 100),
      };
    }
    
    return results;
  }
  
  static async getLowCapGems(limit: number = 10) {
    const tradingPairs = await this.getTradingPairs();
    const results = [];
    
    for (const pair of tradingPairs.slice(0, limit)) {
      const marketData = await this.getMarketData(pair);
      if (marketData) {
        results.push({
          trading_pair: pair,
          ...marketData
        });
      }
    }
    
    return results;
  }
}