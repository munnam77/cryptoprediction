import { WS_CONFIG } from '../config/binance.config';
import type { WebSocketMessage, MarketData } from '../types/binance';

/**
 * BinanceWebSocketManager
 * 
 * Manages WebSocket connections to Binance API for real-time data
 * Implements automatic reconnection, error handling, and efficient data processing
 */
class BinanceWebSocketManager {
  private static instance: BinanceWebSocketManager;
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private subscribedSymbols: string[] = [];
  private callbacks: Map<string, Function[]> = new Map();
  private isConnected = false;
  private pendingSubscriptions: string[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;
  private messageQueue: any[] = [];
  private processingQueue = false;
  private connectionStartTime = 0;
  private messageCount = 0;
  private lastLogTime = 0;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): BinanceWebSocketManager {
    if (!BinanceWebSocketManager.instance) {
      BinanceWebSocketManager.instance = new BinanceWebSocketManager();
    }
    return BinanceWebSocketManager.instance;
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    if (this.socket) {
      this.cleanupSocket();
    }
    
    try {
      console.log('Initializing WebSocket connection to Binance...');
      this.socket = new WebSocket(WS_CONFIG.baseUrl);
      this.connectionStartTime = Date.now();
      this.messageCount = 0;
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      
      // Start heartbeat monitoring
      this.startHeartbeat();
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Subscribe to any pending subscriptions
    if (this.pendingSubscriptions.length > 0) {
      this.subscribeToStreams(this.pendingSubscriptions);
      this.pendingSubscriptions = [];
    }
    
    // Resubscribe to previously subscribed symbols
    if (this.subscribedSymbols.length > 0) {
      this.subscribeToStreams(this.subscribedSymbols.map(symbol => `${symbol.toLowerCase()}@ticker`));
    }
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    this.lastMessageTime = Date.now();
    this.messageCount++;
    
    // Log performance metrics every 60 seconds
    const now = Date.now();
    if (now - this.lastLogTime > 60000) {
      const uptime = (now - this.connectionStartTime) / 1000;
      const messagesPerSecond = this.messageCount / uptime;
      console.log(`WebSocket performance: ${messagesPerSecond.toFixed(2)} messages/sec, uptime: ${uptime.toFixed(0)}s`);
      this.lastLogTime = now;
    }
    
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Add to message queue for batch processing
      this.messageQueue.push(message);
      
      // Process queue if not already processing
      if (!this.processingQueue) {
        this.processMessageQueue();
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Process message queue in batches for better performance
   */
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) {
      this.processingQueue = false;
      return;
    }
    
    this.processingQueue = true;
    
    // Process up to 50 messages at a time
    const batch = this.messageQueue.splice(0, 50);
    
    // Group messages by stream type for more efficient processing
    const streamGroups = new Map<string, any[]>();
    
    batch.forEach(message => {
      if (message.stream && message.data) {
        const streamParts = message.stream.split('@');
        const symbol = streamParts[0].toUpperCase();
        const streamType = streamParts[1];
        const callbackKey = `${symbol}:${streamType}`;
        
        if (!streamGroups.has(callbackKey)) {
          streamGroups.set(callbackKey, []);
        }
        
        streamGroups.get(callbackKey)?.push(message.data);
      }
    });
    
    // Process each group of messages
    streamGroups.forEach((data, callbackKey) => {
      const callbacks = this.callbacks.get(callbackKey) || [];
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in callback for ${callbackKey}:`, error);
        }
      });
    });
    
    // Allow UI to update before processing more messages
    if (this.messageQueue.length > 0) {
      setTimeout(() => this.processMessageQueue(), 0);
    } else {
      this.processingQueue = false;
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.scheduleReconnect();
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
    this.isConnected = false;
    this.scheduleReconnect();
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
      console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeWebSocket();
      }, delay);
          } else {
      console.error('Maximum reconnection attempts reached. Please refresh the page.');
    }
  }
  
  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.lastMessageTime = Date.now();
    
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastMessageTime;
      
      // If no message received in 30 seconds, reconnect
      if (elapsed > 30000 && this.isConnected) {
        console.warn('No WebSocket messages received in 30 seconds, reconnecting...');
        this.cleanupSocket();
        this.initializeWebSocket();
      }
    }, 10000); // Check every 10 seconds
  }
  
  /**
   * Clean up WebSocket resources
   */
  private cleanupSocket(): void {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      
      this.socket = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Clear message queue
    this.messageQueue = [];
    this.processingQueue = false;
  }
  
  /**
   * Subscribe to WebSocket streams
   */
  private subscribeToStreams(streams: string[]): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.pendingSubscriptions = [...this.pendingSubscriptions, ...streams];
      
      if (!this.isConnected) {
        this.initializeWebSocket();
      }
      
      return;
    }
    
    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: streams,
      id: Date.now()
    };
    
    try {
      this.socket.send(JSON.stringify(subscribeMessage));
      console.log(`Subscribed to streams: ${streams.join(', ')}`);
    } catch (error) {
      console.error('Error subscribing to streams:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Unsubscribe from WebSocket streams
   */
  private unsubscribeFromStreams(streams: string[]): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const unsubscribeMessage = {
      method: 'UNSUBSCRIBE',
      params: streams,
      id: Date.now()
    };
    
    try {
      this.socket.send(JSON.stringify(unsubscribeMessage));
      console.log(`Unsubscribed from streams: ${streams.join(', ')}`);
    } catch (error) {
      console.error('Error unsubscribing from streams:', error);
    }
  }
  
  /**
   * Subscribe to ticker updates for multiple symbols
   */
  public subscribeToTickerUpdates(symbols: string[], callback: (data: any[]) => void): void {
    // Store the symbols for reconnection
    this.subscribedSymbols = [...new Set([...this.subscribedSymbols, ...symbols])];
    
    // Create streams for each symbol
    const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
    
    // Store callback for each symbol
    symbols.forEach(symbol => {
      const callbackKey = `${symbol}:ticker`;
      if (!this.callbacks.has(callbackKey)) {
        this.callbacks.set(callbackKey, []);
      }
      this.callbacks.get(callbackKey)?.push(callback);
    });
    
    // Subscribe to streams
    this.subscribeToStreams(streams);
  }
  
  /**
   * Unsubscribe from all WebSocket streams
   */
  public unsubscribeAll(): void {
    if (this.subscribedSymbols.length === 0) {
      return;
    }
    
    const streams = this.subscribedSymbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
    this.unsubscribeFromStreams(streams);
    
    this.subscribedSymbols = [];
    this.callbacks.clear();
  }
  
  /**
   * Close WebSocket connection and clean up resources
   */
  public close(): void {
    this.unsubscribeAll();
    this.cleanupSocket();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export default BinanceWebSocketManager;
