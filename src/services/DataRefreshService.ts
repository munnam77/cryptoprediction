import { BinanceTicker, BinanceSymbolInfo, MarketData } from '../types/binance';
import { TradingPair } from '../components/TradingPairTable';

/**
 * DataRefreshService
 * Handles fetching live Binance data with a 30-second refresh cycle
 */
class DataRefreshService {
  private static instance: DataRefreshService;
  private refreshInterval: number = 30000; // 30 seconds
  private refreshTimer: NodeJS.Timeout | null = null;
  private progressCallbacks: ((progress: number) => void)[] = [];
  private dataCallbacks: ((data: TradingPair[]) => void)[] = [];
  private lastRefreshTime: number = 0;
  private currentProgress: number = 100;
  private isRefreshing: boolean = false;
  private tradingPairs: TradingPair[] = [];
  private binanceApiBase: string = 'https://api.binance.com/api/v3';

  private constructor() {
    // Initialize with immediate data fetch
    this.fetchData();
    
    // Start progress timer
    this.startProgressTimer();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DataRefreshService {
    if (!DataRefreshService.instance) {
      DataRefreshService.instance = new DataRefreshService();
    }
    return DataRefreshService.instance;
  }

  /**
   * Start the progress timer that updates every second
   */
  private startProgressTimer(): void {
    // Update progress every second
    setInterval(() => {
      if (!this.isRefreshing) {
        const elapsedTime = Date.now() - this.lastRefreshTime;
        const newProgress = Math.max(0, 100 - (elapsedTime / this.refreshInterval) * 100);
        this.currentProgress = newProgress;
        
        // Notify progress listeners
        this.notifyProgressListeners(newProgress);
        
        // Trigger refresh when progress reaches 0
        if (newProgress <= 0 && !this.isRefreshing) {
          this.fetchData();
        }
      }
    }, 1000);
  }

  /**
   * Fetch data from Binance API
   */
  private async fetchData(): Promise<void> {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    this.notifyProgressListeners(0);
    
    try {
      // Step 1: Get all USDT trading pairs
      const pairs = await this.getUSDTPairs();
      
      // Step 2: Get 24hr ticker data for all pairs
      const tickers = await this.get24hrTickers();
      
      // Step 3: Filter and transform data
      const tradingPairs = this.transformData(pairs, tickers);
      
      // Update state
      this.tradingPairs = tradingPairs;
      
      // Notify data listeners
      this.notifyDataListeners(tradingPairs);
      
      // Update refresh time
      this.lastRefreshTime = Date.now();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.isRefreshing = false;
      this.currentProgress = 100;
      this.notifyProgressListeners(100);
    }
  }

  /**
   * Get all USDT trading pairs from Binance
   */
  private async getUSDTPairs(): Promise<BinanceSymbolInfo[]> {
    try {
      const response = await fetch(`${this.binanceApiBase}/exchangeInfo`);
      const data = await response.json();
      
      // Filter for USDT pairs
      return data.symbols.filter((symbol: any) => 
        symbol.quoteAsset === 'USDT' && 
        symbol.status === 'TRADING' &&
        symbol.isSpotTradingAllowed
      );
    } catch (error) {
      console.error('Error fetching USDT pairs:', error);
      return [];
    }
  }

  /**
   * Get 24hr ticker data for all pairs
   */
  private async get24hrTickers(): Promise<BinanceTicker[]> {
    try {
      const response = await fetch(`${this.binanceApiBase}/ticker/24hr`);
      const data = await response.json();
      
      // Filter for valid data
      return data.filter((ticker: any) => 
        ticker.symbol && 
        ticker.symbol.endsWith('USDT') &&
        parseFloat(ticker.quoteVolume) > 1000000 // Minimum 1M USDT volume
      );
    } catch (error) {
      console.error('Error fetching 24hr tickers:', error);
      return [];
    }
  }

  /**
   * Transform Binance data to TradingPair format
   */
  private transformData(pairs: BinanceSymbolInfo[], tickers: BinanceTicker[]): TradingPair[] {
    // Create a map of symbols to tickers for faster lookup
    const tickerMap = new Map<string, BinanceTicker>();
    tickers.forEach(ticker => {
      tickerMap.set(ticker.symbol, ticker);
    });
    
    // Transform data
    return pairs
      .filter(pair => tickerMap.has(pair.symbol))
      .map(pair => {
        const ticker = tickerMap.get(pair.symbol)!;
        const baseAsset = pair.baseAsset;
        const quoteAsset = pair.quoteAsset;
        
        // Calculate order book imbalance (mock for now, would need order book data)
        const orderBookImbalance = Math.random() * 200 - 100;
        
        // Calculate price velocity (mock for now, would need historical data)
        const priceVelocity = Math.random() * 10 - 5;
        
        // Determine velocity trend
        const velocityTrend: 'accelerating' | 'decelerating' | 'stable' = 
          priceVelocity > 2 ? 'accelerating' : 
          priceVelocity < -2 ? 'decelerating' : 'stable';
        
        // Calculate pump probability (mock for now, would need more data)
        const pumpProbability = Math.random() * 100;
        
        return {
          symbol: pair.symbol,
          baseAsset,
          quoteAsset,
          price: parseFloat(ticker.lastPrice),
          priceChange24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.quoteVolume),
          marketCap: undefined, // Would need additional API call
          orderBookImbalance,
          priceVelocity,
          velocityTrend,
          pumpProbability,
          lastUpdated: Date.now()
        };
      })
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 100); // Limit to top 100 by volume
  }

  /**
   * Subscribe to progress updates
   */
  public subscribeToProgress(callback: (progress: number) => void): () => void {
    this.progressCallbacks.push(callback);
    
    // Immediately notify with current progress
    callback(this.currentProgress);
    
    // Return unsubscribe function
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to data updates
   */
  public subscribeToData(callback: (data: TradingPair[]) => void): () => void {
    this.dataCallbacks.push(callback);
    
    // Immediately notify with current data if available
    if (this.tradingPairs.length > 0) {
      callback(this.tradingPairs);
    }
    
    // Return unsubscribe function
    return () => {
      this.dataCallbacks = this.dataCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify progress listeners
   */
  private notifyProgressListeners(progress: number): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  /**
   * Notify data listeners
   */
  private notifyDataListeners(data: TradingPair[]): void {
    this.dataCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in data callback:', error);
      }
    });
  }

  /**
   * Force refresh data
   */
  public forceRefresh(): void {
    if (!this.isRefreshing) {
      this.fetchData();
    }
  }

  /**
   * Get current data
   */
  public getCurrentData(): TradingPair[] {
    return [...this.tradingPairs];
  }

  /**
   * Get current progress
   */
  public getCurrentProgress(): number {
    return this.currentProgress;
  }
}

export default DataRefreshService; 