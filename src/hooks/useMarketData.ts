import { useState, useEffect, useCallback } from 'react';
import { BinanceService } from '../services/binance/BinanceService';
import { DatabaseService } from '../services/database/DatabaseService';
import { TimeframeOption } from '../config/database.config';

interface MarketData {
  tradingPair: string;
  price: number;
  timeframeChangePct: number | null; // Percentage change based on selected timeframe
  volumeChangePct: number | null; // Volume change based on selected timeframe
  marketCap: number | null;
  volatilityScore: number | null; // 0-100 score
  liquidityScore: number | null; // 0-100 score
  predictionConfidence: number | null; // 0-100 percentage
  heatmapScore: number | null; // For heatmap indicator
  timestamp: number;
  priceChangePercent: Record<TimeframeOption, number | null>;
  volumeChangePercent: Record<TimeframeOption, number | null>;
  volatility: Record<TimeframeOption, number | null>;
}

interface MarketDataOptions {
  excludeTop10?: boolean;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  timeframe: TimeframeOption;
  limit?: number;
  refreshInterval?: number;
}

/**
 * Hook to fetch and manage market data with multi-timeframe support
 */
export function useMarketData({
  excludeTop10 = true,
  minMarketCap,
  maxMarketCap,
  minVolume,
  timeframe = '1h',
  limit = 100,
  refreshInterval = 60000, // 1 minute refresh by default
}: MarketDataOptions = { timeframe: '1h' }) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data for all trading pairs
  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get trading pairs that match our criteria
      const tradingPairs = await BinanceService.getTradingPairs(
        minMarketCap,
        maxMarketCap,
        minVolume
      );
      
      const marketDataPromises = tradingPairs.slice(0, limit).map(async (tradingPair) => {
        // Get basic market data
        const baseData = await BinanceService.getMarketData(tradingPair);
        
        if (!baseData) return null;
        
        // Get timeframe-specific metrics from database
        const timeframeMetrics = await DatabaseService.getTimeframeMetrics(
          tradingPair,
          timeframe
        );
        
        // Get latest prediction for this timeframe and trading pair
        const latestPredictions = await DatabaseService.getTopPredictions(timeframe);
        const prediction = latestPredictions.find(p => p.trading_pair === tradingPair);
        
        return {
          tradingPair,
          price: baseData.price,
          timeframeChangePct: timeframeMetrics?.price_change_pct || null,
          volumeChangePct: timeframeMetrics?.volume_change_pct || null,
          marketCap: baseData.marketCap,
          volatilityScore: timeframeMetrics?.volatility_score || null,
          liquidityScore: timeframeMetrics?.liquidity_score || null,
          predictionConfidence: prediction?.confidence_score || null,
          // Calculate heatmap score (0-100) based on multiple factors
          heatmapScore: calculateHeatmapScore(
            timeframeMetrics?.price_change_pct || 0,
            timeframeMetrics?.volume_change_pct || 0,
            prediction?.predicted_change_pct || 0,
            prediction?.confidence_score || 0
          ),
          timestamp: Date.now(),
          // Add timeframe-specific data
          priceChangePercent: {
            '15m': timeframeMetrics?.price_change_pct_15m || null,
            '30m': timeframeMetrics?.price_change_pct_30m || null,
            '1h': timeframeMetrics?.price_change_pct_1h || null,
            '4h': timeframeMetrics?.price_change_pct_4h || null,
            '1d': timeframeMetrics?.price_change_pct_1d || null,
          },
          volumeChangePercent: {
            '15m': timeframeMetrics?.volume_change_pct_15m || null,
            '30m': timeframeMetrics?.volume_change_pct_30m || null,
            '1h': timeframeMetrics?.volume_change_pct_1h || null,
            '4h': timeframeMetrics?.volume_change_pct_4h || null,
            '1d': timeframeMetrics?.volume_change_pct_1d || null,
          },
          volatility: {
            '15m': timeframeMetrics?.volatility_15m || null,
            '30m': timeframeMetrics?.volatility_30m || null,
            '1h': timeframeMetrics?.volatility_1h || null,
            '4h': timeframeMetrics?.volatility_4h || null,
            '1d': timeframeMetrics?.volatility_1d || null,
          }
        };
      });
      
      const results = (await Promise.all(marketDataPromises)).filter(Boolean) as MarketData[];
      setMarketData(results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch market data'));
      console.error('Error in useMarketData:', err);
    } finally {
      setLoading(false);
    }
  }, [excludeTop10, minMarketCap, maxMarketCap, minVolume, timeframe, limit]);
  
  // Calculate heatmap score based on multiple factors
  const calculateHeatmapScore = (
    priceChangePct: number,
    volumeChangePct: number,
    predictedChangePct: number,
    confidenceScore: number
  ): number => {
    // Combined weighted score
    const weights = {
      priceChange: 0.3,
      volumeChange: 0.3,
      prediction: 0.2,
      confidence: 0.2
    };
    
    // Normalize each factor to 0-100 scale
    const normalizedPriceChange = Math.min(100, Math.max(0, (priceChangePct + 10) * 5)); // -10% to +10% → 0-100
    const normalizedVolumeChange = Math.min(100, Math.max(0, (volumeChangePct + 20) * 2.5)); // -20% to +20% → 0-100
    const normalizedPrediction = Math.min(100, Math.max(0, (predictedChangePct + 10) * 5)); // -10% to +10% → 0-100
    
    const weightedScore = 
      (normalizedPriceChange * weights.priceChange) +
      (normalizedVolumeChange * weights.volumeChange) +
      (normalizedPrediction * weights.prediction) +
      (confidenceScore * weights.confidence);
    
    return Math.round(weightedScore);
  };

  // Set up periodic refresh
  useEffect(() => {
    fetchMarketData();
    
    const intervalId = setInterval(fetchMarketData, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMarketData, refreshInterval]);
  
  // Function to manually refresh
  const refresh = () => {
    fetchMarketData();
  };
  
  // Function to sort data
  const sortData = (key: keyof MarketData, direction: 'asc' | 'desc') => {
    setMarketData(prevData => {
      return [...prevData].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        
        if (aValue === null) return direction === 'asc' ? -1 : 1;
        if (bValue === null) return direction === 'asc' ? 1 : -1;
        
        return direction === 'asc' 
          ? (aValue < bValue ? -1 : 1) 
          : (aValue > bValue ? -1 : 1);
      });
    });
  };
  
  // Function to filter data
  const filterData = (filterFn: (item: MarketData) => boolean) => {
    setMarketData(prevData => {
      return prevData.filter(filterFn);
    });
  };

  // Function to get market data for a specific symbol
  const getMarketData = async (symbol: string): Promise<MarketData | null> => {
    try {
      const baseData = await BinanceService.getMarketData(symbol);
      if (!baseData) return null;
      
      const timeframeMetrics = await DatabaseService.getTimeframeMetrics(symbol, timeframe);
      const latestPredictions = await DatabaseService.getTopPredictions(timeframe);
      const prediction = latestPredictions.find(p => p.trading_pair === symbol);
      
      return {
        tradingPair: symbol,
        price: baseData.price,
        timeframeChangePct: timeframeMetrics?.price_change_pct || null,
        volumeChangePct: timeframeMetrics?.volume_change_pct || null,
        marketCap: baseData.marketCap,
        volatilityScore: timeframeMetrics?.volatility_score || null,
        liquidityScore: timeframeMetrics?.liquidity_score || null,
        predictionConfidence: prediction?.confidence_score || null,
        heatmapScore: calculateHeatmapScore(
          timeframeMetrics?.price_change_pct || 0,
          timeframeMetrics?.volume_change_pct || 0,
          prediction?.predicted_change_pct || 0,
          prediction?.confidence_score || 0
        ),
        timestamp: Date.now(),
        // Add timeframe-specific data
        priceChangePercent: {
          '15m': timeframeMetrics?.price_change_pct_15m || null,
          '30m': timeframeMetrics?.price_change_pct_30m || null,
          '1h': timeframeMetrics?.price_change_pct_1h || null,
          '4h': timeframeMetrics?.price_change_pct_4h || null,
          '1d': timeframeMetrics?.price_change_pct_1d || null,
        },
        volumeChangePercent: {
          '15m': timeframeMetrics?.volume_change_pct_15m || null,
          '30m': timeframeMetrics?.volume_change_pct_30m || null,
          '1h': timeframeMetrics?.volume_change_pct_1h || null,
          '4h': timeframeMetrics?.volume_change_pct_4h || null,
          '1d': timeframeMetrics?.volume_change_pct_1d || null,
        },
        volatility: {
          '15m': timeframeMetrics?.volatility_15m || null,
          '30m': timeframeMetrics?.volatility_30m || null,
          '1h': timeframeMetrics?.volatility_1h || null,
          '4h': timeframeMetrics?.volatility_4h || null,
          '1d': timeframeMetrics?.volatility_1d || null,
        }
      };
    } catch (err) {
      console.error('Error fetching market data for symbol:', symbol, err);
      return null;
    }
  };

  return {
    marketData,
    loading,
    error,
    refresh,
    sortData,
    filterData,
    timeframe,
    getMarketData
  };
}