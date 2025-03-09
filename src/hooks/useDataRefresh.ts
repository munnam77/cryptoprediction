import { useState, useEffect } from 'react';
import DataRefreshService from '../services/DataRefreshService';
import { TradingPair } from '../components/TradingPairTable';

/**
 * Hook to use the DataRefreshService with a 30-second refresh cycle
 */
export const useDataRefresh = () => {
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [progress, setProgress] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Get service instance
    const service = DataRefreshService.getInstance();
    
    // Subscribe to data updates
    const dataUnsubscribe = service.subscribeToData((data) => {
      setTradingPairs(data);
      setIsLoading(false);
    });
    
    // Subscribe to progress updates
    const progressUnsubscribe = service.subscribeToProgress((value) => {
      setProgress(value);
    });
    
    // Cleanup subscriptions
    return () => {
      dataUnsubscribe();
      progressUnsubscribe();
    };
  }, []);
  
  // Function to force refresh
  const forceRefresh = () => {
    const service = DataRefreshService.getInstance();
    service.forceRefresh();
  };
  
  // Get top gainers
  const topGainers = tradingPairs
    .filter(pair => pair.priceChange24h > 0)
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, 10);
  
  // Get top picks based on pump probability and order book imbalance
  const topPicks = tradingPairs
    .filter(pair => pair.pumpProbability > 60 || Math.abs(pair.orderBookImbalance) > 50)
    .sort((a, b) => b.pumpProbability - a.pumpProbability)
    .slice(0, 10);
  
  return {
    tradingPairs,
    topGainers,
    topPicks,
    progress,
    isLoading,
    forceRefresh
  };
}; 