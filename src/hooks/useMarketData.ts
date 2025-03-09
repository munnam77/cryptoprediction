import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get initial market data
        const initialData = await BinanceService.getComprehensiveMarketData(timeframe);
        if (!mounted) return;

        // Filter for requested symbols
        const filteredData = initialData.filter(data => symbols.includes(data.symbol));
        setMarketData(filteredData);
        
        // Subscribe to real-time updates if not in historical view
        if (!isHistoricalView) {
          BinanceService.subscribeToMarketData(symbols, (updatedData) => {
            if (!mounted) return;
            setMarketData(prev => {
              // Merge updated data with existing data
              const merged = [...prev];
              updatedData.forEach(update => {
                const index = merged.findIndex(item => item.symbol === update.symbol);
                if (index !== -1) {
                  merged[index] = {
                    ...merged[index],
                    ...update,
                    historicalData: merged[index].historicalData // Preserve historical data
                  };
                }
              });
              return merged;
            });
          });
        }

        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching market data:', err);
        setError('Failed to fetch market data');
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Cleanup subscription
    return () => {
      mounted = false;
      if (!isHistoricalView) {
        BinanceService.unsubscribeFromMarketData();
      }
    };
  }, [symbols, timeframe, isHistoricalView, historicalTimestamp]);

  return {
    marketData,
    isLoading,
    error,
    refresh: () => {
      setIsLoading(true);
      BinanceService.getComprehensiveMarketData(timeframe)
        .then(data => {
          const filteredData = data.filter(item => symbols.includes(item.symbol));
          setMarketData(filteredData);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error refreshing market data:', err);
          setError('Failed to refresh market data');
          setIsLoading(false);
        });
    }
  };
};