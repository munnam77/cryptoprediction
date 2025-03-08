import Binance from 'binance-api-node';
import { KlineInterval } from '../types/binance';
import { BINANCE_CONFIG } from '../../config/binance.config';
import { DataValidationService } from '../validation/DataValidationService';
import { ErrorRecoveryService } from '../error/ErrorRecoveryService';
import { CacheService } from '../cache/CacheService';

interface BinanceServiceConfig {
  enableRateLimit: boolean;
  enableCache: boolean;
  enableValidation: boolean;
  enableErrorRecovery: boolean;
}

export class BinanceService {
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

  constructor(config: Partial<BinanceServiceConfig> = {}) {
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
}