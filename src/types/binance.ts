export enum KlineInterval {
    ONE_MINUTE = '1m',
    THREE_MINUTES = '3m',
    FIVE_MINUTES = '5m',
    FIFTEEN_MINUTES = '15m',
    THIRTY_MINUTES = '30m',
    ONE_HOUR = '1h',
    TWO_HOURS = '2h',
    FOUR_HOURS = '4h',
    SIX_HOURS = '6h',
    EIGHT_HOURS = '8h',
    TWELVE_HOURS = '12h',
    ONE_DAY = '1d',
    THREE_DAYS = '3d',
    ONE_WEEK = '1w',
    ONE_MONTH = '1M'
  }
  
  export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface Ticker {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastPrice: string;
    lastQty: string;
    bidPrice: string;
    askPrice: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
  }

export interface BinanceSymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  isSpotTradingAllowed: boolean;
}

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  trades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface BinanceTicker {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  bidPrice: string;
  askPrice: string;
}

export interface MarketData {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  price: number;
  priceChangePercent: number;
  priceChangePercent7d?: number;
  volume: number;
  volumeChangePercent: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  circulatingSupply?: number;
  liquidity: number;
  volatility: number;
  sentiment?: number;
  prediction: 'up' | 'down' | 'neutral';
  confidence: number;
  trending?: boolean;
  watchlist?: boolean;
  description?: string;
}

export interface WebSocketMessage {
  stream: string;
  data: any;
}

export interface RealTimeUpdate {
  eventType: string;
  eventTime: number;
  symbol: string;
  price: string;
  quantity: string;
  buyerOrderId: number;
  sellerOrderId: number;
  tradeTime: number;
  isBuyerMaker: boolean;
}

export interface KlineStreamData {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  k: {
    t: number;    // Kline start time
    T: number;    // Kline close time
    s: string;    // Symbol
    i: string;    // Interval
    f: number;    // First trade ID
    L: number;    // Last trade ID
    o: string;    // Open price
    c: string;    // Close price
    h: string;    // High price
    l: string;    // Low price
    v: string;    // Base asset volume
    n: number;    // Number of trades
    x: boolean;   // Is this kline closed?
    q: string;    // Quote asset volume
    V: string;    // Taker buy base asset volume
    Q: string;    // Taker buy quote asset volume
    B: string;    // Ignore
  };
}

export interface BookTickerStreamData {
  u: number;      // Order book updateId
  s: string;      // Symbol
  b: string;      // Best bid price
  B: string;      // Best bid qty
  a: string;      // Best ask price
  A: string;      // Best ask qty
}

export type TimeFrame = '15m' | '30m' | '1h' | '4h' | '1d';

// Add PriceVelocity type
export interface PriceVelocity {
  velocity: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
}