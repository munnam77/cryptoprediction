export interface CacheConfig {
    maxAge: number; // milliseconds
    maxSize: number; // number of items
  }
  
  export interface CacheItem<T> {
    data: T;
    timestamp: number;
  }
  
  export class CacheService<T> {
    private cache: Map<string, CacheItem<T>> = new Map();
    private config: CacheConfig;
  
    constructor(config: CacheConfig) {
      this.config = config;
      this.startCleanupInterval();
    }
  
    set(key: string, data: T): void {
      // Remove oldest items if cache is full
      if (this.cache.size >= this.config.maxSize) {
        const oldestKey = this.findOldestKey();
        if (oldestKey) this.cache.delete(oldestKey);
      }
  
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  
    get(key: string): T | null {
      const item = this.cache.get(key);
      if (!item) return null;
  
      // Check if item is expired
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return null;
      }
  
      return item.data;
    }
  
    has(key: string): boolean {
      const item = this.cache.get(key);
      if (!item) return false;
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return false;
      }
      return true;
    }
  
    delete(key: string): void {
      this.cache.delete(key);
    }
  
    clear(): void {
      this.cache.clear();
    }
  
    private isExpired(item: CacheItem<T>): boolean {
      return Date.now() - item.timestamp > this.config.maxAge;
    }
  
    private findOldestKey(): string | null {
      let oldestKey: string | null = null;
      let oldestTimestamp = Infinity;
  
      for (const [key, item] of this.cache.entries()) {
        if (item.timestamp < oldestTimestamp) {
          oldestTimestamp = item.timestamp;
          oldestKey = key;
        }
      }
  
      return oldestKey;
    }
  
    private startCleanupInterval(): void {
      setInterval(() => {
        for (const [key, item] of this.cache.entries()) {
          if (this.isExpired(item)) {
            this.cache.delete(key);
          }
        }
      }, Math.min(this.config.maxAge, 60000)); // Run cleanup at least every minute
    }
  }