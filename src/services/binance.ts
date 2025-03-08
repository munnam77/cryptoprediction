const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

export interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
}

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

// Cache for storing the latest ticker data
const tickerCache = new Map<string, TickerData>();

function getReconnectDelay(): number {
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(
    INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY
  );
  const jitter = Math.random() * 1000;
  return exponentialDelay + jitter;
}

// Mock data for development (in case API fails)
const mockTickers: TickerData[] = [
  {
    symbol: 'BTCUSDT',
    priceChange: '234.52000000',
    priceChangePercent: '1.25',
    lastPrice: '42350.52000000',
    volume: '24385.12300000',
    quoteVolume: '1034567890.12345678'
  },
  {
    symbol: 'ETHUSDT',
    priceChange: '45.52000000',
    priceChangePercent: '2.35',
    lastPrice: '2230.52000000',
    volume: '124385.12300000',
    quoteVolume: '304567890.12345678'
  },
  {
    symbol: 'SOLUSDT',
    priceChange: '-3.52000000',
    priceChangePercent: '-1.35',
    lastPrice: '120.52000000',
    volume: '524385.12300000',
    quoteVolume: '74567890.12345678'
  },
  {
    symbol: 'BNBUSDT',
    priceChange: '12.52000000',
    priceChangePercent: '1.95',
    lastPrice: '565.52000000',
    volume: '94385.12300000',
    quoteVolume: '53567890.12345678'
  },
  {
    symbol: 'XRPUSDT',
    priceChange: '0.05200000',
    priceChangePercent: '3.25',
    lastPrice: '0.55000000',
    volume: '324385.12300000',
    quoteVolume: '2567890.12345678'
  },
  {
    symbol: 'ADAUSDT',
    priceChange: '-0.02500000',
    priceChangePercent: '-2.15',
    lastPrice: '0.42000000',
    volume: '624385.12300000',
    quoteVolume: '1267890.12345678'
  }
];

// Use mock data when in development or fallback
function loadMockData(): TickerData[] {
  mockTickers.forEach(ticker => {
    tickerCache.set(ticker.symbol, ticker);
  });
  return mockTickers;
}

export async function get24hrTickers(): Promise<TickerData[]> {
  try {
    // Try to get data from cache first
    if (tickerCache.size > 0) {
      return Array.from(tickerCache.values());
    }
    
    const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const filteredData = data.filter((ticker: TickerData) => 
      ticker.symbol.endsWith('USDT')
    );
    
    // Update cache
    filteredData.forEach((ticker: TickerData) => {
      tickerCache.set(ticker.symbol, ticker);
    });
    
    return filteredData;
  } catch (error) {
    console.error('Error fetching 24hr tickers:', error);
    // Return cached data if available, otherwise mock data
    return tickerCache.size > 0 ? Array.from(tickerCache.values()) : loadMockData();
  }
}

export async function getKlines(
  symbol: string,
  interval: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const response = await fetch(
      `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching klines:', error);
    return [];
  }
}

function validateTickerData(data: any): boolean {
  return (
    data &&
    typeof data.s === 'string' &&
    typeof data.p === 'string' &&
    typeof data.P === 'string' &&
    typeof data.c === 'string' &&
    typeof data.v === 'string' &&
    typeof data.q === 'string'
  );
}

function createWebSocket(callback: (data: TickerData[]) => void): WebSocket {
  // Using browser's built-in WebSocket
  const wsInstance = new WebSocket(`${BINANCE_WS_BASE}/!ticker@arr`);
  
  wsInstance.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
  };
  
  wsInstance.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const usdtPairs = data
        .filter((ticker: any) => {
          if (!validateTickerData(ticker)) {
            console.warn('Invalid ticker data received:', ticker);
            return false;
          }
          return ticker.s.endsWith('USDT');
        })
        .map((ticker: any) => {
          const tickerData = {
            symbol: ticker.s,
            priceChange: ticker.p,
            priceChangePercent: ticker.P,
            lastPrice: ticker.c,
            volume: ticker.v,
            quoteVolume: ticker.q
          };
          // Update cache
          tickerCache.set(tickerData.symbol, tickerData);
          return tickerData;
        });
      callback(usdtPairs);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
  
  wsInstance.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Fall back to mock data if WebSocket fails
    callback(loadMockData());
  };
  
  wsInstance.onclose = () => {
    console.log('WebSocket connection closed');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = getReconnectDelay();
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => {
        reconnectAttempts++;
        ws = createWebSocket(callback);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      // Fall back to mock data if reconnection fails
      callback(loadMockData());
    }
  };
  
  return wsInstance;
}

export function subscribeToTickers(callback: (data: TickerData[]) => void): void {
  if (ws) {
    ws.close();
  }
  
  try {
    ws = createWebSocket(callback);
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    // Fallback to mock data
    callback(loadMockData());
  }
}

export function unsubscribeFromTickers(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
  reconnectAttempts = 0;
}

// Heartbeat function - modified for browser compatibility
// No need to use ping() as browser WebSockets handle ping/pong internally