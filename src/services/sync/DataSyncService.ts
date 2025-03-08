import { BinanceService } from '../binance/BinanceService';
import { CacheService } from '../cache/CacheService';
import { PredictionService } from '../prediction/PredictionService';

interface SyncConfig {
  updateInterval: number;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
}

interface SyncStats {
  lastSync: number;
  successfulUpdates: number;
  failedUpdates: number;
  averageLatency: number;
}

export class DataSyncService {
  private binanceService: BinanceService;
  private predictionService: PredictionService;
  private cache: CacheService<any>;
  private config: SyncConfig;
  private syncStats: SyncStats;
  private updateQueue: Set<string> = new Set();
  private isProcessing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(
    binanceService: BinanceService,
    predictionService: PredictionService,
    config: Partial<SyncConfig> = {}
  ) {
    this.binanceService = binanceService;
    this.predictionService = predictionService;
    this.config = {
      updateInterval: 5000, // 5 seconds
      batchSize: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.cache = new CacheService({
      maxAge: 60000, // 1 minute
      maxSize: 1000
    });

    this.syncStats = {
      lastSync: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      averageLatency: 0
    };
  }

  async start(): Promise<void> {
    if (this.syncInterval) return;

    await this.binanceService.initialize();
    this.setupWebSocketConnections();
    this.startPeriodicSync();
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private setupWebSocketConnections(): void {
    const symbols = this.binanceService.getAvailableSymbols();
    symbols.forEach(symbol => {
      this.binanceService.subscribeToSymbol(symbol, (data) => {
        this.handleRealtimeUpdate(symbol, data);
      });
    });
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      await this.processSyncQueue();
    }, this.config.updateInterval);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.size === 0) return;

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      const updates = Array.from(this.updateQueue).slice(0, this.config.batchSize);
      await this.processUpdates(updates);
      this.updateQueue.clear();

      // Update sync stats
      const latency = Date.now() - startTime;
      this.updateSyncStats(updates.length, 0, latency);
    } catch (error) {
      console.error('Error processing sync queue:', error);
      this.updateSyncStats(0, this.updateQueue.size, Date.now() - startTime);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processUpdates(symbols: string[]): Promise<void> {
    const updatePromises = symbols.map(async (symbol) => {
      for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
        try {
          const [marketData, prediction] = await Promise.all([
            this.binanceService.get24hrStats(symbol),
            this.predictionService.predict(symbol)
          ]);

          const cacheKey = `${symbol}_data`;
          this.cache.set(cacheKey, {
            marketData,
            prediction,
            timestamp: Date.now()
          });

          return true;
        } catch (error) {
          if (attempt === this.config.retryAttempts - 1) throw error;
          await this.delay(this.config.retryDelay);
        }
      }
    });

    await Promise.all(updatePromises);
  }

  private handleRealtimeUpdate(symbol: string, data: any): void {
    const cacheKey = `${symbol}_data`;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      // Update only changed fields
      const updatedData = {
        ...cachedData,
        marketData: {
          ...cachedData.marketData,
          ...data
        },
        timestamp: Date.now()
      };
      this.cache.set(cacheKey, updatedData);
    }

    this.updateQueue.add(symbol);
  }

  private updateSyncStats(successful: number, failed: number, latency: number): void {
    this.syncStats.lastSync = Date.now();
    this.syncStats.successfulUpdates += successful;
    this.syncStats.failedUpdates += failed;
    this.syncStats.averageLatency = (this.syncStats.averageLatency + latency) / 2;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for monitoring
  getSyncStats(): SyncStats {
    return { ...this.syncStats };
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache['cache'].size,
      hitRate: 0 // Implement hit rate calculation if needed
    };
  }

  getQueueSize(): number {
    return this.updateQueue.size;
  }
}