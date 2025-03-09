import axios from 'axios';
import { CacheService } from '../cache/CacheService';
import { ErrorRecoveryService } from '../error/ErrorRecoveryService';

interface MarketDataConfig {
  preferredSource: 'binance' | 'coingecko';
  cacheDuration: number;
  retryAttempts: number;
}

export class MarketDataService {
  private static readonly BINANCE_API_URL = 'https://api.binance.com/api/v3';
  private static readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
  private cache: CacheService<any>;
  private errorRecovery: ErrorRecoveryService;
  private wsConnections: Map<string, WebSocket> = new Map();

  constructor(private config: MarketDataConfig = {
    preferredSource: 'binance',
    cacheDuration: 5000,
    retryAttempts: 3
  }) {
    this.cache = new CacheService({
      maxAge: config.cacheDuration,
      maxSize: 1000
    });
    this.errorRecovery = new ErrorRecoveryService();
    this.setupWebSockets();
  }

  private setupWebSockets(): void {
    // Binance WebSocket for price updates
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      // Subscribe to miniTicker stream for all USDT pairs
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: ['!miniTicker@arr'],
        id: 1
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle subscription confirmation
        if (data.result === null && data.id === 1) {
          console.log('Successfully subscribed to miniTicker stream');
          return;
        }

        // Handle ticker updates
        if (Array.isArray(data)) {
          data
            .filter((ticker: any) => ticker.s && ticker.s.endsWith('USDT'))
            .forEach((ticker: any) => {
              const symbol = ticker.s;
              const price = parseFloat(ticker.c);
              const volume = parseFloat(ticker.v);
              const priceData = { 
                price, 
                volume, 
                timestamp: Date.now(),
                priceChange: parseFloat(ticker.p),
                priceChangePercent: parseFloat(ticker.P),
                high: parseFloat(ticker.h),
                low: parseFloat(ticker.l)
              };
              this.cache.set(`price_${symbol}`, priceData);
              // Emit an event for UI updates
              this.emit('priceUpdate', { symbol, data: priceData });
            });
        }
      } catch (error) {
        console.error('WebSocket data parsing error:', error);
      }
    };

    ws.onerror = async (error) => {
      console.error('WebSocket error:', error);
      await this.reconnectWebSocket();
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed, attempting to reconnect...');
      this.reconnectWebSocket();
    };

    this.wsConnections.set('prices', ws);
  }

  private async reconnectWebSocket(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.setupWebSockets();
  }

  async getActivePairs(): Promise<string[]> {
    try {
      const cacheKey = 'active_pairs';
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${MarketDataService.BINANCE_API_URL}/exchangeInfo`);
      const pairs = response.data.symbols
        .filter((s: any) => 
          s.quoteAsset === 'USDT' && 
          s.status === 'TRADING' &&
          !this.isBlacklisted(s.baseAsset)
        )
        .map((s: any) => s.symbol);

      this.cache.set(cacheKey, pairs);
      return pairs;
    } catch (error) {
      console.error('Failed to fetch active pairs from Binance, trying CoinGecko...');
      return this.getActiveCoinsFromCoinGecko();
    }
  }

  private async getActiveCoinsFromCoinGecko(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${MarketDataService.COINGECKO_API_URL}/coins/markets`, {
          params: {
            vs_currency: 'usdt',
            order: 'market_cap_desc',
            per_page: 250,
            sparkline: false
          }
        }
      );

      return response.data
        .filter((coin: any) => !this.isBlacklisted(coin.symbol.toUpperCase()))
        .map((coin: any) => `${coin.symbol.toUpperCase()}USDT`);
    } catch (error) {
      console.error('Failed to fetch from CoinGecko:', error);
      return [];
    }
  }

  private isBlacklisted(symbol: string): boolean {
    const blacklist = ['LUNA', 'SAFEMOON', 'SQUID'];
    return blacklist.includes(symbol.toUpperCase());
  }

  async getPrice(symbol: string): Promise<number | null> {
    try {
      // Check cache first
      const cached = this.cache.get(`price_${symbol}`);
      if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
        return cached.price;
      }

      const response = await axios.get(`${MarketDataService.BINANCE_API_URL}/ticker/price`, {
        params: { symbol }
      });

      const price = parseFloat(response.data.price);
      this.cache.set(`price_${symbol}`, { price, timestamp: Date.now() });
      return price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol} from Binance, trying CoinGecko...`);
      return this.getPriceFromCoinGecko(symbol);
    }
  }

  private async getPriceFromCoinGecko(symbol: string): Promise<number | null> {
    try {
      const coinId = await this.getCoinGeckoId(symbol);
      if (!coinId) return null;

      const response = await axios.get(
        `${MarketDataService.COINGECKO_API_URL}/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: 'usd'
          }
        }
      );

      return response.data[coinId].usd;
    } catch (error) {
      console.error(`Failed to fetch price from CoinGecko for ${symbol}:`, error);
      return null;
    }
  }

  async getTopVolumePairs(limit: number = 10): Promise<Array<{ symbol: string; volume: number }>> {
    try {
      const response = await axios.get(`${MarketDataService.BINANCE_API_URL}/ticker/24hr`);
      
      return response.data
        .filter((ticker: any) => 
          ticker.symbol.endsWith('USDT') &&
          !this.isBlacklisted(ticker.symbol.replace('USDT', ''))
        )
        .sort((a: any, b: any) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, limit)
        .map((ticker: any) => ({
          symbol: ticker.symbol,
          volume: parseFloat(ticker.volume)
        }));
    } catch (error) {
      console.error('Failed to fetch top volume pairs from Binance, trying CoinGecko...');
      return this.getTopVolumeFromCoinGecko(limit);
    }
  }

  private async getTopVolumeFromCoinGecko(limit: number): Promise<Array<{ symbol: string; volume: number }>> {
    try {
      const response = await axios.get(
        `${MarketDataService.COINGECKO_API_URL}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            order: 'volume_desc',
            per_page: limit,
            sparkline: false
          }
        }
      );

      return response.data
        .filter((coin: any) => !this.isBlacklisted(coin.symbol.toUpperCase()))
        .map((coin: any) => ({
          symbol: `${coin.symbol.toUpperCase()}USDT`,
          volume: coin.total_volume
        }));
    } catch (error) {
      console.error('Failed to fetch top volume from CoinGecko:', error);
      return [];
    }
  }

  async getKlines(symbol: string, interval: string, limit: number = 100): Promise<any[]> {
    try {
      const cacheKey = `klines_${symbol}_${interval}_${limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${MarketDataService.BINANCE_API_URL}/klines`, {
        params: { symbol, interval, limit }
      });

      const klines = response.data.map((k: any[]) => ({
        timestamp: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));

      this.cache.set(cacheKey, klines);
      return klines;
    } catch (error) {
      console.error(`Failed to fetch klines for ${symbol}:`, error);
      return [];
    }
  }

  private coinGeckoIdCache: Map<string, string> = new Map();

  private async getCoinGeckoId(symbol: string): Promise<string | null> {
    const normalizedSymbol = symbol.replace('USDT', '').toLowerCase();
    
    if (this.coinGeckoIdCache.has(normalizedSymbol)) {
      return this.coinGeckoIdCache.get(normalizedSymbol) || null;
    }

    try {
      const response = await axios.get(`${MarketDataService.COINGECKO_API_URL}/coins/list`);
      const coin = response.data.find((c: any) => c.symbol === normalizedSymbol);
      
      if (coin) {
        this.coinGeckoIdCache.set(normalizedSymbol, coin.id);
        return coin.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch CoinGecko ID:', error);
      return null;
    }
  }

  cleanup(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.cache.clear();
  }
}