import { BehaviorSubject } from 'rxjs';
import * as BinanceService from './BinanceService';
import type { MarketData, TimeFrame } from '../types/binance';

/**
 * DataRefreshService
 * Handles automatic data refreshing at specified intervals
 * Provides real-time updates similar to cryptobubbles.net with 30-second refresh
 */
class DataRefreshService {
  // Refresh interval in milliseconds (30 seconds)
  private static REFRESH_INTERVAL = 30 * 1000;
  
  // Progress tracking (0-100%)
  private progressSubject = new BehaviorSubject<number>(0);
  public progress$ = this.progressSubject.asObservable();
  
  // Market data subjects
  private marketDataSubject = new BehaviorSubject<MarketData[]>([]);
  public marketData$ = this.marketDataSubject.asObservable();
  
  private topGainersSubject = new BehaviorSubject<MarketData[]>([]);
  public topGainers$ = this.topGainersSubject.asObservable();
  
  private lowCapGemsSubject = new BehaviorSubject<MarketData[]>([]);
  public lowCapGems$ = this.lowCapGemsSubject.asObservable();
  
  private topVolatilitySubject = new BehaviorSubject<MarketData[]>([]);
  public topVolatility$ = this.topVolatilitySubject.asObservable();
  
  // Refresh timers
  private refreshTimer: NodeJS.Timeout | null = null;
  private progressTimer: NodeJS.Timeout | null = null;
  
  // Selected timeframe
  private timeframe: TimeFrame = '1d';
  
  // Performance tracking
  private lastRefreshTime = 0;
  private refreshCount = 0;
  private totalRefreshTime = 0;
  private isRefreshing = false;
  
  // Cache for market data
  private marketDataCache = new Map<string, MarketData[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  // Singleton instance
  private static instance: DataRefreshService;

  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): DataRefreshService {
    if (!DataRefreshService.instance) {
      DataRefreshService.instance = new DataRefreshService();
    }
    return DataRefreshService.instance;
  }

  /**
   * Start the auto-refresh service
   * @param timeframe The timeframe to use for data
   */
  public start(timeframe: TimeFrame = '1d'): void {
    this.timeframe = timeframe;
    
    // Clear any existing timers
    this.stop();
    
    // Initial data fetch
    this.refreshData();
    
    // Set up the refresh timer (every 30 seconds)
    this.refreshTimer = setInterval(() => {
      this.refreshData();
    }, DataRefreshService.REFRESH_INTERVAL);
    
    // Set up progress timer (updates every second)
    this.startProgressTimer();
    
    console.log(`DataRefreshService started with ${timeframe} timeframe`);
  }
  
  /**
   * Stop the auto-refresh service
   */
  public stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    
    this.progressSubject.next(0);
    console.log('DataRefreshService stopped');
  }
  
  /**
   * Change the timeframe and refresh data
   * @param timeframe The new timeframe
   */
  public changeTimeframe(timeframe: TimeFrame): void {
    this.timeframe = timeframe;
    this.refreshData();
    
    // Reset progress
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressSubject.next(0);
      this.startProgressTimer();
    }
    
    console.log(`Timeframe changed to ${timeframe}`);
  }
  
  /**
   * Force a manual refresh of the data
   */
  public forceRefresh(): void {
    this.refreshData();
    
    // Reset progress
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressSubject.next(0);
      this.startProgressTimer();
    }
    
    console.log('Manual refresh triggered');
  }
  
  /**
   * Start the progress timer that updates the progress bar
   */
  private startProgressTimer(): void {
    // Update progress every second
    const updateInterval = 1000;
    const steps = DataRefreshService.REFRESH_INTERVAL / updateInterval;
    let currentStep = 0;
    
    this.progressTimer = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / steps) * 100));
      this.progressSubject.next(progress);
      
      // Reset when we reach 100%
      if (progress >= 100) {
        currentStep = 0;
      }
    }, updateInterval);
  }
  
  /**
   * Check if cached data is available and valid
   * @param cacheKey The cache key
   * @returns The cached data or null if not available
   */
  private getCachedData<T>(cacheKey: string): T | null {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(cacheKey) || 0;
    
    if (now < expiry && this.marketDataCache.has(cacheKey)) {
      return this.marketDataCache.get(cacheKey) as T;
    }
    
    return null;
  }
  
  /**
   * Cache data with expiry
   * @param cacheKey The cache key
   * @param data The data to cache
   */
  private cacheData<T>(cacheKey: string, data: T): void {
    this.marketDataCache.set(cacheKey, data as any);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }
  
  /**
   * Refresh all market data
   */
  private async refreshData(): Promise<void> {
    // Prevent concurrent refreshes
    if (this.isRefreshing) {
      console.log('Refresh already in progress, skipping');
      return;
    }
    
    this.isRefreshing = true;
    const startTime = performance.now();
    
    try {
      console.log(`Refreshing market data for timeframe: ${this.timeframe}`);
      
      // Fetch comprehensive market data
      const cacheKey = `marketData:${this.timeframe}`;
      let marketData = this.getCachedData<MarketData[]>(cacheKey);
      
      if (!marketData) {
        marketData = await BinanceService.getComprehensiveMarketData(this.timeframe);
        this.cacheData(cacheKey, marketData);
      }
      
      this.marketDataSubject.next(marketData);
      
      // Get top gainers (limit to 10)
      const topGainersKey = `topGainers:${this.timeframe}`;
      let topGainers = this.getCachedData<MarketData[]>(topGainersKey);
      
      if (!topGainers) {
        topGainers = await BinanceService.getTopGainers(this.timeframe, 10);
        this.cacheData(topGainersKey, topGainers);
      }
      
      this.topGainersSubject.next(topGainers);
      
      // Get low cap gems (limit to 10)
      const lowCapGemsKey = `lowCapGems:${this.timeframe}`;
      let lowCapGems = this.getCachedData<MarketData[]>(lowCapGemsKey);
      
      if (!lowCapGems) {
        lowCapGems = await BinanceService.getLowCapGems(this.timeframe, 10000000, 500000000, 10);
        this.cacheData(lowCapGemsKey, lowCapGems);
      }
      
      this.lowCapGemsSubject.next(lowCapGems);
      
      // Get top volatility coins (using getTopGainers and sorting by volatility)
      const topVolatilityKey = `topVolatility:${this.timeframe}`;
      let topVolatility = this.getCachedData<MarketData[]>(topVolatilityKey);
      
      if (!topVolatility) {
        const allMarketData = [...marketData];
        topVolatility = allMarketData
          .sort((a, b) => {
            const aVolatility = a.volatility || 0;
            const bVolatility = b.volatility || 0;
            return bVolatility - aVolatility;
          })
          .slice(0, 10);
        
        this.cacheData(topVolatilityKey, topVolatility);
      }
      
      this.topVolatilitySubject.next(topVolatility);
      
      // Track performance metrics
      const endTime = performance.now();
      const refreshTime = endTime - startTime;
      
      this.refreshCount++;
      this.totalRefreshTime += refreshTime;
      this.lastRefreshTime = refreshTime;
      
      const avgRefreshTime = this.totalRefreshTime / this.refreshCount;
      
      console.log(`Data refresh complete for timeframe: ${this.timeframe}`);
      console.log(`Refresh performance: ${refreshTime.toFixed(0)}ms (avg: ${avgRefreshTime.toFixed(0)}ms)`);
    } catch (error) {
      console.error('Error refreshing market data:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    refreshCount: number;
    lastRefreshTime: number;
    avgRefreshTime: number;
  } {
    return {
      refreshCount: this.refreshCount,
      lastRefreshTime: this.lastRefreshTime,
      avgRefreshTime: this.totalRefreshTime / Math.max(1, this.refreshCount)
    };
  }
}

export default DataRefreshService; 