/**
 * BinanceWebSocketManager
 * Manages WebSocket connections to Binance API for real-time data
 */
import { API_CONFIG, WS_CONFIG } from '../config/binance.config';
import { WebSocketMessage, MarketData, RealTimeUpdate, KlineStreamData, BookTickerStreamData } from '../types/binance';

class BinanceWebSocketManager {
  private static instance: BinanceWebSocketManager;
  private socketMap: Map<string, WebSocket>;
  private reconnectTimeouts: Map<string, NodeJS.Timeout>;
  private dataHandlers: Map<string, Function[]>;

  private constructor() {
    this.socketMap = new Map();
    this.reconnectTimeouts = new Map();
    this.dataHandlers = new Map();
  }

  public static getInstance(): BinanceWebSocketManager {
    if (!BinanceWebSocketManager.instance) {
      BinanceWebSocketManager.instance = new BinanceWebSocketManager();
    }
    return BinanceWebSocketManager.instance;
  }

  /**
   * Subscribe to ticker updates for multiple symbols
   * @param symbols Array of symbols to subscribe to (e.g. ["BTCUSDT", "ETHUSDT"])
   * @param onUpdate Callback function to receive updates
   */
  public subscribeToTickerUpdates(symbols: string[], onUpdate: (data: MarketData[]) => void): void {
    // Close any existing connections
    this.closeExistingConnections('ticker');

    if (!symbols || symbols.length === 0) {
      console.warn('No symbols provided for ticker subscription');
      return;
    }

    // Format symbols for Binance WebSocket API
    const formattedSymbols = symbols.map(s => s.toLowerCase() + '@ticker');
    const streamName = 'ticker';

    // Register the data handler
    this.registerDataHandler(streamName, (data: any) => {
      const marketData = this.convertTickerToMarketData(data);
      if (marketData) {
        onUpdate([marketData]);
      }
    });

    // Create WebSocket connection
    const wsUrl = `${API_CONFIG.wsUrl}/stream?streams=${formattedSymbols.join('/')}`;
    this.createSocketConnection(streamName, wsUrl);
  }

  /**
   * Subscribe to kline/candlestick updates for a symbol
   * @param symbol Symbol to subscribe to (e.g. "BTCUSDT")
   * @param interval Candlestick interval
   * @param onUpdate Callback function to receive updates
   */
  public subscribeToKlineUpdates(
    symbol: string,
    interval: string,
    onUpdate: (data: any) => void
  ): void {
    const streamName = `${symbol.toLowerCase()}_kline_${interval}`;
    const wsUrl = `${API_CONFIG.wsUrl}/ws/${symbol.toLowerCase()}@kline_${interval}`;

    // Register data handler
    this.registerDataHandler(streamName, (data: KlineStreamData) => {
      onUpdate(data);
    });

    this.createSocketConnection(streamName, wsUrl);
  }

  /**
   * Subscribe to order book updates for a symbol
   * @param symbol Symbol to subscribe to
   * @param onUpdate Callback function to receive updates
   */
  public subscribeToBookTickerUpdates(
    symbol: string,
    onUpdate: (data: any) => void
  ): void {
    const streamName = `${symbol.toLowerCase()}_bookTicker`;
    const wsUrl = `${API_CONFIG.wsUrl}/ws/${symbol.toLowerCase()}@bookTicker`;

    // Register data handler
    this.registerDataHandler(streamName, (data: BookTickerStreamData) => {
      onUpdate(data);
    });

    this.createSocketConnection(streamName, wsUrl);
  }

  /**
   * Unsubscribe from ticker updates
   */
  public unsubscribeFromTickerUpdates(): void {
    this.closeExistingConnections('ticker');
  }

  /**
   * Unsubscribe from all WebSocket streams
   */
  public unsubscribeAll(): void {
    this.socketMap.forEach((socket, key) => {
      this.closeSocketConnection(key);
    });
  }

  /**
   * Create a new WebSocket connection
   * @param streamName Unique name for the stream
   * @param wsUrl WebSocket URL
   */
  private createSocketConnection(streamName: string, wsUrl: string): void {
    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log(`WebSocket connection established for ${streamName}`);
        // Clear any reconnect timeout
        if (this.reconnectTimeouts.has(streamName)) {
          clearTimeout(this.reconnectTimeouts.get(streamName)!);
          this.reconnectTimeouts.delete(streamName);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const handlers = this.dataHandlers.get(streamName) || [];
          
          // For combined streams, data comes in a specific format
          if (message.stream && message.data) {
            handlers.forEach(handler => handler(message.data));
          } else {
            // For single streams
            handlers.forEach(handler => handler(message));
          }
        } catch (error) {
          console.error(`Error parsing WebSocket message for ${streamName}:`, error);
        }
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for ${streamName}:`, error);
      };

      socket.onclose = (event) => {
        console.warn(`WebSocket closed for ${streamName} with code ${event.code}`);
        
        // Attempt to reconnect if enabled
        if (WS_CONFIG.reconnect.enabled) {
          this.scheduleReconnection(streamName, wsUrl);
        }
      };

      this.socketMap.set(streamName, socket);
    } catch (error) {
      console.error(`Error creating WebSocket connection for ${streamName}:`, error);
      
      // Attempt to reconnect
      if (WS_CONFIG.reconnect.enabled) {
        this.scheduleReconnection(streamName, wsUrl);
      }
    }
  }

  /**
   * Close an existing WebSocket connection
   * @param streamName Name of the stream to close
   */
  private closeSocketConnection(streamName: string): void {
    const socket = this.socketMap.get(streamName);
    if (socket) {
      socket.close();
      this.socketMap.delete(streamName);
    }

    // Clear any reconnect timeout
    if (this.reconnectTimeouts.has(streamName)) {
      clearTimeout(this.reconnectTimeouts.get(streamName)!);
      this.reconnectTimeouts.delete(streamName);
    }

    // Clear data handlers
    this.dataHandlers.delete(streamName);
  }

  /**
   * Close any existing connections for a stream type
   * @param streamPrefix Prefix of stream names to close
   */
  private closeExistingConnections(streamPrefix: string): void {
    this.socketMap.forEach((_, key) => {
      if (key.startsWith(streamPrefix)) {
        this.closeSocketConnection(key);
      }
    });
  }

  /**
   * Schedule a reconnection attempt
   * @param streamName Stream name to reconnect
   * @param wsUrl WebSocket URL
   */
  private scheduleReconnection(streamName: string, wsUrl: string): void {
    if (this.reconnectTimeouts.has(streamName)) {
      clearTimeout(this.reconnectTimeouts.get(streamName)!);
    }

    const timeout = setTimeout(() => {
      console.log(`Attempting to reconnect ${streamName}...`);
      this.createSocketConnection(streamName, wsUrl);
    }, WS_CONFIG.reconnect.delay);

    this.reconnectTimeouts.set(streamName, timeout);
  }

  /**
   * Register a data handler for a stream
   * @param streamName Stream name
   * @param handler Handler function
   */
  private registerDataHandler(streamName: string, handler: Function): void {
    if (!this.dataHandlers.has(streamName)) {
      this.dataHandlers.set(streamName, []);
    }
    this.dataHandlers.get(streamName)!.push(handler);
  }

  /**
   * Convert ticker data to MarketData format
   * @param tickerData Raw ticker data from WebSocket
   * @returns Formatted MarketData object
   */
  private convertTickerToMarketData(tickerData: any): MarketData | null {
    try {
      const symbol = tickerData.s; // Symbol
      
      // Extract necessary parts from symbol (e.g., BTC from BTCUSDT)
      let baseAsset = symbol;
      let quoteAsset = 'USDT';
      
      if (symbol.endsWith('USDT')) {
        baseAsset = symbol.slice(0, -4);
        quoteAsset = 'USDT';
      } else if (symbol.endsWith('BTC')) {
        baseAsset = symbol.slice(0, -3);
        quoteAsset = 'BTC';
      }

      return {
        symbol,
        baseAsset,
        quoteAsset,
        price: parseFloat(tickerData.c),
        priceChangePercent: parseFloat(tickerData.P),
        volume: parseFloat(tickerData.q),
        volumeChangePercent: 0, // Not provided in ticker, would need additional calculation
        liquidity: 0, // Would need to be calculated from other data
        rsi: 0, // Would need calculation from historical data
        btcCorrelation: 0, // Would need calculation from historical data
        priceVelocity: 0, // Would need calculation from recent price changes
        priceVelocityTrend: 'stable' as const
      };
    } catch (error) {
      console.error('Error converting ticker data to MarketData:', error);
      return null;
    }
  }
}

// Export singleton instance methods
export const subscribeToTickerUpdates = (symbols: string[], onUpdate: (data: MarketData[]) => void) => {
  BinanceWebSocketManager.getInstance().subscribeToTickerUpdates(symbols, onUpdate);
};

export const subscribeToKlineUpdates = (symbol: string, interval: string, onUpdate: (data: any) => void) => {
  BinanceWebSocketManager.getInstance().subscribeToKlineUpdates(symbol, interval, onUpdate);
};

export const subscribeToBookTickerUpdates = (symbol: string, onUpdate: (data: any) => void) => {
  BinanceWebSocketManager.getInstance().subscribeToBookTickerUpdates(symbol, onUpdate);
};

export const unsubscribeFromTickerUpdates = () => {
  BinanceWebSocketManager.getInstance().unsubscribeFromTickerUpdates();
};

export const unsubscribeAll = () => {
  BinanceWebSocketManager.getInstance().unsubscribeAll();
};

// Change to default export
export default BinanceWebSocketManager;