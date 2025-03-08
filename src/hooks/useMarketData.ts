import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketDataService } from '../services/market/MarketDataService';
import { MarketTicker, Kline, KlineInterval } from '../types/market';

export const useMarketData = () => {
  const serviceRef = useRef<MarketDataService>(new MarketDataService());
  const [activePairs, setActivePairs] = useState<string[]>([]);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [topPairs, setTopPairs] = useState<Array<{ symbol: string; volume: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get active pairs
  const fetchActivePairs = useCallback(async () => {
    try {
      const pairs = await serviceRef.current.getActivePairs();
      setActivePairs(pairs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch active pairs');
      console.error(err);
    }
  }, []);

  // Get real-time price for a symbol
  const getPrice = useCallback(async (symbol: string): Promise<number | null> => {
    try {
      const price = await serviceRef.current.getPrice(symbol);
      if (price) {
        setPrices(prev => new Map(prev).set(symbol, price));
      }
      return price;
    } catch (err) {
      console.error(`Failed to fetch price for ${symbol}:`, err);
      return null;
    }
  }, []);

  // Get top volume pairs
  const fetchTopPairs = useCallback(async (limit: number = 10) => {
    try {
      const pairs = await serviceRef.current.getTopVolumePairs(limit);
      setTopPairs(pairs);
      setError(null);
    } catch (err) {
      setError('Failed to fetch top pairs');
      console.error(err);
    }
  }, []);

  // Get historical data
  const getKlines = useCallback(async (
    symbol: string,
    interval: KlineInterval,
    limit: number = 100
  ): Promise<Kline[]> => {
    try {
      return await serviceRef.current.getKlines(symbol, interval, limit);
    } catch (err) {
      console.error(`Failed to fetch klines for ${symbol}:`, err);
      return [];
    }
  }, []);

  // Subscribe to real-time price updates for specific symbols
  const subscribeToSymbols = useCallback((symbols: string[]) => {
    symbols.forEach(symbol => {
      // Initial price fetch
      getPrice(symbol);
      
      // Set up periodic updates
      const interval = setInterval(() => {
        getPrice(symbol);
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    });
  }, [getPrice]);

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchActivePairs(),
        fetchTopPairs()
      ]);
      setIsLoading(false);
    };

    init();

    // Cleanup on unmount
    return () => {
      serviceRef.current.cleanup();
    };
  }, [fetchActivePairs, fetchTopPairs]);

  return {
    // Data
    activePairs,
    prices,
    topPairs,
    isLoading,
    error,

    // Methods
    getPrice,
    getKlines,
    subscribeToSymbols,
    refreshActivePairs: fetchActivePairs,
    refreshTopPairs: fetchTopPairs,
  };
};

// Example usage in a React component:
/*
import { useMarketData } from '../hooks/useMarketData';

const CryptoTracker: React.FC = () => {
  const {
    activePairs,
    prices,
    topPairs,
    isLoading,
    error,
    getPrice,
    getKlines,
    subscribeToSymbols
  } = useMarketData();

  useEffect(() => {
    // Subscribe to BTC and ETH price updates
    subscribeToSymbols(['BTCUSDT', 'ETHUSDT']);
  }, [subscribeToSymbols]);

  // Get historical data for BTC
  useEffect(() => {
    const fetchHistory = async () => {
      const btcHistory = await getKlines('BTCUSDT', KlineInterval.ONE_HOUR, 24);
      console.log('BTC 24h history:', btcHistory);
    };
    
    fetchHistory();
  }, [getKlines]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Top Trading Pairs</h2>
      {topPairs.map(pair => (
        <div key={pair.symbol}>
          {pair.symbol}: ${prices.get(pair.symbol)?.toFixed(2) || 'Loading...'}
        </div>
      ))}
    </div>
  );
};
*/