import Binance from 'binance-api-node';
import axios from 'axios';
import { KlineInterval } from '../types/binance';
import { BINANCE_CONFIG } from '../../config/binance.config';
import { DB_CONFIG, TimeframeOption } from '../../config/database.config';
import { DataValidationService } from '../validation/DataValidationService';
import { ErrorRecoveryService } from '../error/ErrorRecoveryService';
import { CacheService } from '../cache/CacheService';
import { DatabaseService } from '../database/DatabaseService';

interface BinanceServiceConfig {
  enableRateLimit: boolean;
  enableCache: boolean;
  enableValidation: boolean;
  enableErrorRecovery: boolean;
}

export class BinanceService {
  private static instance: BinanceService;
  private client: any;
  private symbols: string[] = [];
  private subscribers: Map<string, Function[]> = new Map();
  private wsConnections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private validationService: DataValidationService;
  private errorRecovery: ErrorRecoveryService;
  private cache: CacheService<any>;
  private rateLimitCounter: number = 0;
  private lastRateLimitReset: number = Date.now();
  private static baseUrl = 'https://api.binance.com/api/v3';
  private static wsBaseUrl = 'wss://stream.binance.com:9443/ws';
  private static webSockets: Map<string, WebSocket> = new Map();
  private static marketDataCache: Map<string, any> = new Map();
  private static topMarketCapCoins: string[] = [];

  private constructor(config: Partial<BinanceServiceConfig> = {}) {
    const defaultConfig: BinanceServiceConfig = {
      enableRateLimit: true,
      enableCache: true,
      enableValidation: true,
      enableErrorRecovery: true,
      ...config
    };
    
    this.client = Binance({
      apiKey: BINANCE_CONFIG.API_KEY,
      apiSecret: BINANCE_CONFIG.API_SECRET,
      timeout: 30000,
    });
    
    this.validationService = new DataValidationService();
    this.errorRecovery = new ErrorRecoveryService();
    this.cache = new CacheService({
      maxAge: BINANCE_CONFIG.CACHE_DURATION.MARKET_DATA,
      maxSize: 1000
    });
    
    this.setupRateLimitReset();
  }

  public static getInstance(config: Partial<BinanceServiceConfig> = {}): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService(config);
    }
    return BinanceService.instance;
  }

  private setupRateLimitReset(): void {
    setInterval(() => {
      this.rateLimitCounter = 0;
      this.lastRateLimitReset = Date.now();
    }, 60000); // Reset every minute
  }

  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitCounter >= BINANCE_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      const timeToReset = 60000 - (Date.now() - this.lastRateLimitReset);
      throw new Error(`Rate limit exceeded. Please wait ${timeToReset}ms`);
    }
    this.rateLimitCounter++;
  }

  async initialize(): Promise<void> {
    try {
      await this.checkRateLimit();
      const exchangeInfo = await this.client.exchangeInfo();
      
      // Filter and validate trading pairs
      this.symbols = exchangeInfo.symbols
        .filter(s => 
          s.quoteAsset === 'USDT' && 
          s.status === 'TRADING' &&
          !BINANCE_CONFIG.BLACKLISTED_PAIRS.some(blacklisted => 
            s.symbol.includes(blacklisted)
          )
        )
        .map(s => s.symbol);

      // Initialize WebSocket connections
      await this.initializeWebSockets();
      
      // Validate successful initialization
      if (this.symbols.length === 0) {
        throw new Error('No valid trading pairs found');
      }

    } catch (error) {
      await this.errorRecovery.handleError(error, 'initialize');
      throw error;
    }
  }

  private async initializeWebSockets(): Promise<void> {
    // Close existing connections
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.reconnectAttempts.clear();

    // Setup new connections
    if (BINANCE_CONFIG.WS_CHANNELS.TICKERS) {
      this.setupTickerWebSocket();
    }
  }

  private setupTickerWebSocket(): void {
    const ws = this.client.ws.allTickers(tickers => {
      tickers
        .filter(ticker => this.symbols.includes(ticker.symbol))
        .forEach(ticker => {
          if (this.validationService.validateStream('ticker', ticker)) {
            this.updateSubscribers(ticker);
          }
        });
    });

    ws.onerror = async (error) => {
      await this.handleWebSocketError('tickers', error);
    };

    ws.onclose = () => {
      this.handleWebSocketClose('tickers');
    };

    this.wsConnections.set('tickers', ws);
  }

  private async handleWebSocketError(channel: string, error: Error): Promise<void> {
    await this.errorRecovery.handleError(error, `websocket_${channel}`);
    this.attemptReconnect(channel);
  }

  private handleWebSocketClose(channel: string): void {
    this.attemptReconnect(channel);
  }

  private async attemptReconnect(channel: string): Promise<void> {
    const attempts = this.reconnectAttempts.get(channel) || 0;
    
    if (attempts < BINANCE_CONFIG.WS_MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts.set(channel, attempts + 1);
      await new Promise(resolve => 
        setTimeout(resolve, BINANCE_CONFIG.WS_RECONNECT_DELAY)
      );
      
      if (channel === 'tickers') {
        this.setupTickerWebSocket();
      }
    } else {
      throw new Error(`Failed to reconnect WebSocket for ${channel} after ${attempts} attempts`);
    }
  }

  private updateSubscribers(ticker: any): void {
    if (this.subscribers.has(ticker.symbol)) {
      this.subscribers.get(ticker.symbol)?.forEach(callback => {
        try {
          callback(ticker);
        } catch (error) {
          console.error(`Error in subscriber callback for ${ticker.symbol}:`, error);
        }
      });
    }
  }

  async getHistoricalData(
    symbol: string,
    interval: KlineInterval,
    limit: number = 1000
  ): Promise<any[]> {
    try {
      // Validate inputs
      if (!this.symbols.includes(symbol)) {
        throw new Error(`Invalid symbol: ${symbol}`);
      }

      // Check cache
      const cacheKey = `klines_${symbol}_${interval}_${limit}`;
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      await this.checkRateLimit();
      const candles = await this.client.candles({
        symbol,
        interval,
        limit
      });

      const processedCandles = candles.map(candle => ({
        timestamp: candle.openTime,
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume)
      }));

      // Validate data
      if (!processedCandles.every(candle => 
        this.validationService.validateStream('candle', candle)
      )) {
        throw new Error('Invalid candle data received');
      }

      // Cache the results
      this.cache.set(cacheKey, processedCandles);

      return processedCandles;
    } catch (error) {
      await this.errorRecovery.handleError(error, 'getHistoricalData');
      throw error;
    }
  }

  async getTopVolumePairs(limit: number = 10): Promise<string[]> {
    try {
      await this.checkRateLimit();
      const tickers = await this.client.dailyStats();
      
      return tickers
        .filter(ticker => 
          ticker.symbol.endsWith('USDT') &&
          parseFloat(ticker.volume) >= BINANCE_CONFIG.MINIMUM_VOLUME_24H &&
          !BINANCE_CONFIG.BLACKLISTED_PAIRS.some(pair => 
            ticker.symbol.includes(pair)
          )
        )
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, limit)
        .map(ticker => ticker.symbol);
    } catch (error) {
      await this.errorRecovery.handleError(error, 'getTopVolumePairs');
      throw error;
    }
  }

  async get24hrStats(symbol: string): Promise<any> {
    try {
      if (!this.symbols.includes(symbol)) {
        throw new Error(`Invalid symbol: ${symbol}`);
      }

      await this.checkRateLimit();
      const stats = await this.client.dailyStats({ symbol });
      
      if (!this.validationService.validateStream('marketStats', stats)) {
        throw new Error('Invalid market stats received');
      }

      return stats;
    } catch (error) {
      await this.errorRecovery.handleError(error, 'get24hrStats');
      throw error;
    }
  }

  subscribeToSymbol(symbol: string, callback: Function): void {
    if (!this.symbols.includes(symbol)) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }

    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol)?.push(callback);
  }

  unsubscribeFromSymbol(symbol: string, callback: Function): void {
    if (this.subscribers.has(symbol)) {
      const callbacks = this.subscribers.get(symbol) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.subscribers.delete(symbol);
      }
    }
  }

  getAvailableSymbols(): string[] {
    return [...this.symbols];
  }

  async cleanup(): Promise<void> {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.subscribers.clear();
    this.cache.clear();
  }

  /**
   * Initialize the service
   */
  static async initialize() {
    try {
      // Update list of top 10 market cap coins to exclude
      await this.updateTopMarketCapCoins();
      
      console.log('BinanceService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize BinanceService:', error);
      return false;
    }
  }
  
  /**
   * Get list of trading pairs excluding top market cap coins
   * @param minMarketCap Minimum market cap in USD
   * @param maxMarketCap Maximum market cap in USD
   * @param minVolume Minimum 24h volume in USD
   */
  static async getTradingPairs(
    minMarketCap: number = DB_CONFIG.MARKET_CAP.MIN,
    maxMarketCap: number = DB_CONFIG.MARKET_CAP.MAX,
    minVolume: number = BINANCE_CONFIG.MINIMUM_VOLUME_24H
  ): Promise<string[]> {
    try {
      // Get exchange info and ticker price
      const [exchangeInfo, tickerInfo] = await Promise.all([
        axios.get(`${this.baseUrl}/exchangeInfo`),
        axios.get(`${this.baseUrl}/ticker/24hr`)
      ]);
      
      // Filter for USDT pairs
      const usdtSymbols = exchangeInfo.data.symbols
        .filter((symbol: any) => 
          symbol.quoteAsset === 'USDT' && 
          symbol.status === 'TRADING' &&
          !BINANCE_CONFIG.BLACKLISTED_PAIRS.includes(symbol.baseAsset)
        )
        .map((symbol: any) => symbol.symbol);
      
      // Get volume data from ticker
      const validPairs: string[] = [];
      
      for (const ticker of tickerInfo.data) {
        if (usdtSymbols.includes(ticker.symbol)) {
          const volume24h = parseFloat(ticker.quoteVolume); // Volume in USDT
          
          if (volume24h >= minVolume) {
            // Format as BASE/QUOTE for consistency
            const baseAsset = ticker.symbol.replace('USDT', '');
            const tradingPair = `${baseAsset}/USDT`;
            
            // Skip if it's in top market cap coins (to be verified after getting market cap)
            if (!this.topMarketCapCoins.includes(baseAsset)) {
              validPairs.push(tradingPair);
            }
          }
        }
      }
      
      return validPairs;
    } catch (error) {
      console.error('Error fetching trading pairs:', error);
      return [];
    }
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
      
      if (cachedData && now - cachedData.timestamp < BINANCE_CONFIG.PRICE_UPDATE_INTERVAL) {
        return cachedData.data;
      }
      
      // Fetch current price ticker
      const tickerResponse = await axios.get(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
      const ticker = tickerResponse.data;
      
      // Get current price
      const price = parseFloat(ticker.lastPrice);
      const volume = parseFloat(ticker.quoteVolume);
      
      // Get market cap if available (from CoinGecko or similar API)
      // Here we're using a simplified approach for this example
      let marketCap: number | undefined = undefined;
      try {
        // In a real implementation, we would fetch this from CoinGecko, CoinMarketCap or similar API
        // For now, we'll use a simple estimation based on circulating supply (if we had it)
        // marketCap = price * circulatingSupply;
        
        // For demo purposes, we'll generate a random market cap within our target range
        if (Math.random() > 0.2) { // 80% of coins in our range
          marketCap = Math.random() * (DB_CONFIG.MARKET_CAP.MAX - DB_CONFIG.MARKET_CAP.MIN) + DB_CONFIG.MARKET_CAP.MIN;
        } else {
          // 20% chance of being above our range (some we'll exclude)
          marketCap = Math.random() * (10_000_000_000 - DB_CONFIG.MARKET_CAP.MAX) + DB_CONFIG.MARKET_CAP.MAX;
        }
      } catch (err) {
        console.warn(`Could not fetch market cap for ${tradingPair}:`, err);
      }
      
      // Construct market data
      const marketData = {
        tradingPair,
        symbol,
        price,
        volume,
        priceChange24h: parseFloat(ticker.priceChangePercent),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        marketCap,
        timestamp: now
      };
      
      // Cache the data
      this.marketDataCache.set(cacheKey, {
        data: marketData,
        timestamp: now
      });
      
      // Store in database for historical tracking
      await DatabaseService.storeRawPriceData(
        tradingPair,
        price,
        volume,
        marketCap
      );
      
      // Also update coin metadata for filtering purposes
      const baseAsset = symbol.replace('USDT', '');
      const isTop10 = this.topMarketCapCoins.includes(baseAsset);
      
      await DatabaseService.updateCoinMetadata(
        tradingPair,
        baseAsset, // Simple name for now
        baseAsset, // Ticker
        marketCap || 0,
        isTop10
      );
      
      return marketData;
    } catch (error) {
      console.error(`Error fetching market data for ${tradingPair}:`, error);
      return null;
    }
  }
  
  /**
   * Get historical kline data for a specific timeframe
   * @param tradingPair Trading pair (e.g., "SOL/USDT")
   * @param timeframe Timeframe to get data for 
   * @param limit Number of data points to return
   */
  static async getKlineData(
    tradingPair: string,
    timeframe: TimeframeOption,
    limit: number = 100
  ) {
    try {
      // Convert from "SOL/USDT" format to "SOLUSDT" for Binance API
      const symbol = tradingPair.replace('/', '');
      
      // Convert timeframe to Binance interval format
      const intervalMap: Record<TimeframeOption, string> = {
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d',
      };
      
      const interval = intervalMap[timeframe];
      
      // Fetch kline data
      const response = await axios.get(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      
      // Transform to our format
      const klines = response.data.map((kline: any) => ({
        openTime: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteAssetVolume: parseFloat(kline[7]),
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: parseFloat(kline[9]),
        takerBuyQuoteAssetVolume: parseFloat(kline[10]),
      }));
      
      return klines;
    } catch (error) {
      console.error(`Error fetching kline data for ${tradingPair} (${timeframe}):`, error);
      return [];
    }
  }
  
  /**
   * Calculate timeframe metrics for all valid timeframes
   * @param tradingPair Trading pair (e.g., "SOL/USDT")
   */
  static async calculateAllTimeframeMetrics(tradingPair: string) {
    const results: Record<TimeframeOption, any> = {} as any;
    
    try {
      // Calculate metrics for each timeframe
      for (const timeframe of ['15m', '30m', '1h', '4h', '1d'] as TimeframeOption[]) {
        const metrics = await DatabaseService.calculateTimeframeMetrics(tradingPair, timeframe);
        results[timeframe] = metrics;
      }
      
      return results;
    } catch (error) {
      console.error(`Error calculating timeframe metrics for ${tradingPair}:`, error);
      return results;
    }
  }
  
  /**
   * Update list of top market cap coins from CoinGecko or similar API
   */
  private static async updateTopMarketCapCoins() {
    try {
      // In a real implementation, we would fetch from CoinGecko or CoinMarketCap API
      // For this example, we'll use a hardcoded list of current top 10 coins
      this.topMarketCapCoins = [
        'BTC', 'ETH', 'BNB', 'SOL', 'XRP',
        'USDC', 'STETH', 'DOGE', 'ADA', 'TRON'
      ];
      
      console.log('Updated top market cap coins:', this.topMarketCapCoins);
      return true;
    } catch (error) {
      console.error('Error updating top market cap coins:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to real-time market updates for a trading pair
   * @param tradingPair Trading pair (e.g., "SOL/USDT")
   * @param callback Function to call when data is received
   */
  static subscribeToMarketUpdates(
    tradingPair: string,
    callback: (data: any) => void
  ) {
    // Convert from "SOL/USDT" format to "solusdt" for Binance websocket
    const symbol = tradingPair.replace('/', '').toLowerCase();
    
    // Close existing connection if any
    if (this.webSockets.has(tradingPair)) {
      this.webSockets.get(tradingPair)?.close();
    }
    
    // Create new WebSocket connection
    const ws = new WebSocket(`${this.wsBaseUrl}/${symbol}@ticker`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for ${tradingPair}`);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Process data and store in database
      const price = parseFloat(data.c); // last price
      const volume = parseFloat(data.q); // 24h volume in quote asset
      
      // Store data in database
      DatabaseService.storeRawPriceData(
        tradingPair,
        price,
        volume
      ).catch(err => console.error(`Failed to store websocket data for ${tradingPair}:`, err));
      
      // Call callback with processed data
      callback({
        tradingPair,
        price,
        volume,
        priceChangePercent: parseFloat(data.P), // 24h price change percent
        timestamp: Date.now()
      });
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error for ${tradingPair}:`, error);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket closed for ${tradingPair}`);
      this.webSockets.delete(tradingPair);
    };
    
    // Store WebSocket for later use
    this.webSockets.set(tradingPair, ws);
    
    return () => {
      // Return a function to unsubscribe
      if (this.webSockets.has(tradingPair)) {
        this.webSockets.get(tradingPair)?.close();
        this.webSockets.delete(tradingPair);
      }
    };
  }
  
  /**
   * Get market data for low-cap gems (coins between $10M and $500M market cap)
   */
  static async getLowCapGems(limit: number = 10) {
    try {
      // Use the database service to get coins in our market cap range
      const lowCapCoins = await DatabaseService.getTradingPairsByMarketCap(
        DB_CONFIG.MARKET_CAP.MIN,
        DB_CONFIG.MARKET_CAP.MAX,
        true // Exclude top 10
      );
      
      // For each trading pair, get current market data
      const results = [];
      
      for (const coin of lowCapCoins.slice(0, limit)) {
        const marketData = await this.getMarketData(coin.trading_pair);
        if (marketData) {
          results.push({
            ...coin,
            ...marketData
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error fetching low cap gems:', error);
      return [];
    }
  }
}