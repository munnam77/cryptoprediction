import { TradingPair } from '../components/TradingPairTable';

/**
 * MockDataService
 * Provides sample data for the trading application
 */
class MockDataService {
  private static readonly SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 
    'XRPUSDT', 'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT',
    'LINKUSDT', 'UNIUSDT', 'SHIBUSDT', 'LTCUSDT', 'ATOMUSDT',
    'ETCUSDT', 'XLMUSDT', 'VETUSDT', 'ICPUSDT', 'FILUSDT'
  ];

  /**
   * Generate mock trading pairs data
   */
  public static getTradingPairs(): TradingPair[] {
    return this.SYMBOLS.map(symbol => {
      // Extract base asset from symbol
      const baseAsset = symbol.replace('USDT', '');
      const quoteAsset = 'USDT';
      
      // Generate random price based on the asset
      const price = this.getBasePrice(baseAsset) * (0.95 + Math.random() * 0.1);
      
      // Generate random price change (-10% to +15%)
      const priceChange24h = -10 + Math.random() * 25;
      
      // Generate random volume based on the asset
      const volume24h = this.getBaseVolume(baseAsset) * (0.7 + Math.random() * 0.6);
      
      // Generate random order book imbalance (-100 to 100)
      const orderBookImbalance = Math.round(-100 + Math.random() * 200);
      
      // Generate random price velocity
      const priceVelocity = -5 + Math.random() * 10;
      
      // Determine velocity trend based on price velocity
      const velocityTrend = priceVelocity > 2 ? 'accelerating' : 
                           priceVelocity < -2 ? 'decelerating' : 'stable';
      
      // Generate random pump probability (0 to 100)
      const pumpProbability = Math.round(Math.random() * 100);
      
      // Set last updated timestamp to now
      const lastUpdated = Date.now() - Math.round(Math.random() * 60000); // 0-60 seconds ago
      
      return {
        symbol,
        baseAsset,
        quoteAsset,
        price,
        priceChange24h,
        volume24h,
        marketCap: price * this.getCirculatingSupply(baseAsset),
        orderBookImbalance,
        priceVelocity,
        velocityTrend,
        pumpProbability,
        lastUpdated
      };
    });
  }
  
  /**
   * Get base price for an asset
   */
  private static getBasePrice(asset: string): number {
    const prices: Record<string, number> = {
      'BTC': 50000,
      'ETH': 3000,
      'BNB': 500,
      'ADA': 0.5,
      'SOL': 100,
      'XRP': 0.5,
      'DOGE': 0.1,
      'DOT': 20,
      'AVAX': 30,
      'MATIC': 1.5,
      'LINK': 15,
      'UNI': 10,
      'SHIB': 0.00001,
      'LTC': 100,
      'ATOM': 10,
      'ETC': 40,
      'XLM': 0.3,
      'VET': 0.05,
      'ICP': 5,
      'FIL': 40
    };
    
    return prices[asset] || 10;
  }
  
  /**
   * Get base volume for an asset
   */
  private static getBaseVolume(asset: string): number {
    const volumes: Record<string, number> = {
      'BTC': 10000000000,
      'ETH': 5000000000,
      'BNB': 1000000000,
      'SOL': 500000000,
      'XRP': 300000000,
      'ADA': 200000000
    };
    
    return volumes[asset] || 50000000 + Math.random() * 100000000;
  }
  
  /**
   * Get circulating supply for an asset
   */
  private static getCirculatingSupply(asset: string): number {
    const supplies: Record<string, number> = {
      'BTC': 19000000,
      'ETH': 120000000,
      'BNB': 200000000,
      'ADA': 35000000000,
      'SOL': 350000000,
      'XRP': 50000000000,
      'DOGE': 132000000000,
      'SHIB': 589000000000000
    };
    
    return supplies[asset] || 1000000000;
  }
}

export default MockDataService; 