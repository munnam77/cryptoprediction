import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, TimeFrame } from '../types/binance';
import BinanceService from '../services/BinanceService';

interface UseMarketDataProps {
  symbols: string[];
  timeframe: TimeFrame;
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
}

/**
 * Custom hook for fetching and managing market data with timeframe support
 * Provides real-time updates and caching for better performance
 */
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
  // We'll use a nested structure to cache by timeframe
  const marketDataCache = useRef<Record<TimeFrame, Record<string, MarketData>>>({
    '15m': {},
    '30m': {},
    '1h': {},
    '4h': {},
    '1d': {}
  });
  
  const wsSubscribed = useRef<boolean>(false);
  const mounted = useRef<boolean>(true);
  const lastTimeframe = useRef<TimeFrame>(timeframe);
  const pendingRequest = useRef<boolean>(false);
  const retryCount = useRef<number>(0);
  const MAX_RETRIES = 3;

  // Helper to update cached data for the current timeframe
  const updateCache = useCallback((data: MarketData[], tf: TimeFrame) => {
    if (!marketDataCache.current[tf]) {
      marketDataCache.current[tf] = {};
    }
    
    data.forEach(item => {
      marketDataCache.current[tf][item.symbol] = {
        ...marketDataCache.current[tf][item.symbol],
        ...item,
      };
    });
  }, []);

  // Get data from cache for the current timeframe
  const getFromCache = useCallback((tf: TimeFrame) => {
    if (!marketDataCache.current[tf]) {
      return [];
    }
    return Object.values(marketDataCache.current[tf]);
  }, []);

  // Check if we have data in cache for a symbol and timeframe
  const isInCache = useCallback((symbol: string, tf: TimeFrame) => {
    return marketDataCache.current[tf] && marketDataCache.current[tf][symbol];
  }, []);

  // Refresh market data for specific symbols and timeframe
  const refresh = useCallback(async (symbolsToRefresh: string[], tf: TimeFrame) => {
    if (!mounted.current || pendingRequest.current) return;
    
    pendingRequest.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching market data for timeframe: ${tf}`);
      
      // Get initial comprehensive data
      const data = await BinanceService.getComprehensiveMarketData(tf);
      
      if (!mounted.current) {
        pendingRequest.current = false;
        return;
      }

      // Filter data for requested symbols
      const filteredData = data.filter(item => 
        symbolsToRefresh.includes(item.symbol)
      );
      
      // Update cache and state
      updateCache(filteredData, tf);
      setMarketData(Object.values(marketDataCache.current[tf]));
      setIsLoading(false);
      retryCount.current = 0;

      // Set up real-time updates if not in historical view
      if (!isHistoricalView && !wsSubscribed.current) {
        BinanceService.subscribeToMarketData(symbolsToRefresh, (updates) => {
          if (!mounted.current) return;
          
          // Apply timeframe-specific transformations to the updates
          const transformedUpdates = updates.map(update => ({
            ...update,
            // Ensure the update has the correct timeframe context
            timeframe: tf
          }));
          
          updateCache(transformedUpdates, tf);
          setMarketData(Object.values(marketDataCache.current[tf]));
        });
        wsSubscribed.current = true;
      }
    } catch (err) {
      if (!mounted.current) {
        pendingRequest.current = false;
        return;
      }
      
      console.error(`Error fetching market data for timeframe ${tf}:`, err);
      setError(`Failed to fetch market data for ${tf} timeframe. Please try again.`);
      
      // Try to use cached data if available
      const cachedData = getFromCache(tf);
      if (cachedData.length > 0) {
        console.log(`Using cached data for timeframe ${tf}`);
        setMarketData(cachedData);
      }
      
      // Implement retry logic
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        console.log(`Retrying (${retryCount.current}/${MAX_RETRIES})...`);
        
        // Exponential backoff
        const delay = 1000 * Math.pow(2, retryCount.current);
        setTimeout(() => {
          if (mounted.current) {
            pendingRequest.current = false;
            refresh(symbolsToRefresh, tf);
          }
        }, delay);
      } else {
        setIsLoading(false);
      }
    } finally {
      pendingRequest.current = false;
    }
  }, [isHistoricalView, updateCache, getFromCache]);

  // Initial data fetch and WebSocket subscription
  useEffect(() => {
    mounted.current = true;

    // Function to fetch initial data
    const fetchInitialData = async () => {
      try {
        // Check if we need to fetch new data due to timeframe change
        const timeframeChanged = lastTimeframe.current !== timeframe;
        lastTimeframe.current = timeframe;
        
        // Get symbols that need updating for this timeframe
        const uncachedSymbols = symbols.filter(
          symbol => !isInCache(symbol, timeframe) || timeframeChanged
        );

        if (uncachedSymbols.length > 0 || timeframeChanged) {
          await refresh(symbols, timeframe);
        } else {
          // Use cached data
          setMarketData(getFromCache(timeframe));
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
  }, [symbols, timeframe, refresh, getFromCache, isInCache]);

  // Handle historical view changes
  useEffect(() => {
    if (isHistoricalView && historicalTimestamp) {
      // For historical view, we should fetch historical data
      // This would typically involve a different API endpoint
      console.log(`Fetching historical data for timeframe ${timeframe} at ${new Date(historicalTimestamp).toISOString()}`);
      
      // For now, we'll just use the current data with a simulated delay
      setIsLoading(true);
      setTimeout(() => {
        if (mounted.current) {
          setMarketData(getFromCache(timeframe));
          setIsLoading(false);
        }
      }, 500);
    }
  }, [isHistoricalView, historicalTimestamp, timeframe, getFromCache]);

  // Debug logging for timeframe changes
  useEffect(() => {
    console.log(`Timeframe changed to: ${timeframe}`);
  }, [timeframe]);

  return {
    marketData,
    isLoading,
    error,
    refresh: (newSymbols: string[] = symbols) => refresh(newSymbols, timeframe),
    // Expose cache for debugging
    cache: marketDataCache.current
  };
};