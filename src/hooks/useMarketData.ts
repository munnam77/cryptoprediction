import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, TimeFrame } from '../types/binance';
import BinanceService from '../services/BinanceService';

interface UseMarketDataProps {
  symbols: string[];
  timeframe: TimeFrame;
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
}

export const useMarketData = ({
  symbols,
  timeframe,
  isHistoricalView = false,
  historicalTimestamp
}: UseMarketDataProps) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache for market data to prevent unnecessary updates
  const marketDataCache = useRef<Record<string, MarketData>>({});
  const wsSubscribed = useRef<boolean>(false);
  const mounted = useRef<boolean>(true);

  // Helper to update cached data
  const updateCache = useCallback((data: MarketData[]) => {
    data.forEach(item => {
      marketDataCache.current[item.symbol] = {
        ...marketDataCache.current[item.symbol],
        ...item,
      };
    });
  }, []);

  // Refresh market data for specific symbols
  const refresh = useCallback(async (symbolsToRefresh: string[]) => {
    if (!mounted.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Get initial comprehensive data
      const data = await BinanceService.getComprehensiveMarketData(timeframe);
      const filteredData = data.filter(item => 
        symbolsToRefresh.includes(item.symbol)
      );
      
      if (!mounted.current) return;

      // Update cache and state
      updateCache(filteredData);
      setMarketData(Object.values(marketDataCache.current));
      setIsLoading(false);

      // Set up real-time updates if not in historical view
      if (!isHistoricalView && !wsSubscribed.current) {
        BinanceService.subscribeToMarketData(symbolsToRefresh, (updates) => {
          if (!mounted.current) return;
          
          updateCache(updates);
          setMarketData(Object.values(marketDataCache.current));
        });
        wsSubscribed.current = true;
      }
    } catch (err) {
      if (!mounted.current) return;
      
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data. Please try again.');
      setIsLoading(false);
    }
  }, [timeframe, isHistoricalView, updateCache]);

  // Initial data fetch and WebSocket subscription
  useEffect(() => {
    mounted.current = true;

    // Function to fetch initial data
    const fetchInitialData = async () => {
      try {
        // Get cached symbols that need updating
        const uncachedSymbols = symbols.filter(
          symbol => !marketDataCache.current[symbol]
        );

        if (uncachedSymbols.length > 0) {
          await refresh(uncachedSymbols);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error in initial data fetch:', err);
        setError('Failed to fetch initial data');
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Cleanup subscriptions
    return () => {
      mounted.current = false;
      if (wsSubscribed.current) {
        BinanceService.unsubscribeFromMarketData();
        wsSubscribed.current = false;
      }
    };
  }, [symbols, refresh]);

  // Handle timeframe changes
  useEffect(() => {
    if (symbols.length > 0) {
      refresh(symbols);
    }
  }, [timeframe, refresh, symbols]);

  // Handle historical view changes
  useEffect(() => {
    if (isHistoricalView && historicalTimestamp) {
      // Implement historical data fetching logic here
      // This would typically involve fetching data from a specific timestamp
      // For now, we'll just use the current data
      setMarketData(Object.values(marketDataCache.current));
    }
  }, [isHistoricalView, historicalTimestamp]);

  return {
    marketData,
    isLoading,
    error,
    refresh: (newSymbols: string[] = symbols) => refresh(newSymbols),
    // Expose cache for debugging
    cache: marketDataCache.current
  };
};