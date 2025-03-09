import { BINANCE_CONFIG } from '../config/binance.config';

export type WebSocketMessage = {
  stream: string;
  data: any;
};

class BinanceWebSocketManager {
  private static instance: BinanceWebSocketManager;
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): BinanceWebSocketManager {
    if (!BinanceWebSocketManager.instance) {
      BinanceWebSocketManager.instance = new BinanceWebSocketManager();
    }
    return BinanceWebSocketManager.instance;
  }

  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const streams = Array.from(this.subscribers.keys()).join('/');
    if (!streams) return;

    const wsUrl = `${import.meta.env.VITE_WEBSOCKET_BASE_URL}/${streams}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const subscribers = this.subscribers.get(message.stream);
        if (subscribers) {
          subscribers.forEach(callback => callback(message.data));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws?.close();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < BINANCE_CONFIG.WS_MAX_RECONNECT_ATTEMPTS) {
      const delay = BINANCE_CONFIG.WS_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(stream: string, callback: (data: any) => void): void {
    if (!this.subscribers.has(stream)) {
      this.subscribers.set(stream, new Set());
    }
    this.subscribers.get(stream)?.add(callback);
    
    // Reconnect with new stream if needed
    this.connect();
  }

  unsubscribe(stream: string, callback: (data: any) => void): void {
    this.subscribers.get(stream)?.delete(callback);
    if (this.subscribers.get(stream)?.size === 0) {
      this.subscribers.delete(stream);
    }

    // Reconnect with updated streams if there are any
    if (this.subscribers.size > 0) {
      this.connect();
    } else {
      this.ws?.close();
      this.ws = null;
    }
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    this.subscribe(`${symbol.toLowerCase()}@ticker`, callback);
  }

  subscribeToKlines(symbol: string, interval: string, callback: (data: any) => void): void {
    this.subscribe(`${symbol.toLowerCase()}@kline_${interval}`, callback);
  }

  subscribeToDayTicker(callback: (data: any) => void): void {
    this.subscribe('!ticker@arr', callback);
  }

  subscribeToMiniTicker(callback: (data: any) => void): void {
    this.subscribe('!miniTicker@arr', callback);
  }

  subscribeToBookTicker(symbol: string, callback: (data: any) => void): void {
    this.subscribe(`${symbol.toLowerCase()}@bookTicker`, callback);
  }

  close(): void {
    this.subscribers.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export default BinanceWebSocketManager;