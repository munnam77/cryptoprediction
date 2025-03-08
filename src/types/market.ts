export interface MarketTicker {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
  }
  
  export interface Kline {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  export interface MarketPair {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
  }
  
  export enum KlineInterval {
    ONE_MINUTE = '1m',
    FIVE_MINUTES = '5m',
    FIFTEEN_MINUTES = '15m',
    THIRTY_MINUTES = '30m',
    ONE_HOUR = '1h',
    FOUR_HOURS = '4h',
    ONE_DAY = '1d',
    ONE_WEEK = '1w',
    ONE_MONTH = '1M'
  }
  
  export interface MarketStats {
    priceChange: number;
    priceChangePercent: number;
    weightedAvgPrice: number;
    prevClosePrice: number;
    lastPrice: number;
    volume: number;
    quoteVolume: number;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
  }