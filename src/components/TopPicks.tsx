import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database/DatabaseService';
import { BinanceService } from '../services/binance/BinanceService';
import { TimeframeOption } from '../config/database.config';

interface TopPicksProps {
  timeframe: TimeframeOption;
  className?: string;
  limit?: number;
}

/**
 * TopPicks Component - Shows low-cap gem recommendations
 * Displays coins from $10M-$500M market cap range with their metrics
 */
const TopPicks: React.FC<TopPicksProps> = ({ 
  timeframe = '1h',
  className = '',
  limit = 5
}) => {
  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTopPicks();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchTopPicks, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [timeframe]);

  const fetchTopPicks = async () => {
    try {
      setLoading(true);
      
      // Get top picks from database
      const picks = await DatabaseService.getTopPicks(limit);
      
      // Enrich with latest market data
      const enrichedPicks = await Promise.all(
        picks.map(async (pick) => {
          const marketData = await BinanceService.getMarketData(pick.trading_pair);
          
          // Get timeframe-specific metrics
          const metrics = await DatabaseService.getTimeframeMetrics(
            pick.trading_pair, 
            timeframe
          );
          
          return {
            ...pick,
            ...marketData,
            timeframeChangePct: metrics?.price_change_pct || null,
            volumeChangePct: metrics?.volume_change_pct || null,
            volatilityScore: metrics?.volatility_score || null,
          };
        })
      );
      
      setTopPicks(enrichedPicks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch top picks'));
      console.error('Error in TopPicks component:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${value.toFixed(2)}`;
    } else if (value >= 1) {
      return `$${value.toFixed(3)}`;
    } else if (value >= 0.01) {
      return `$${value.toFixed(4)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };

  // Format percentage
  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format market cap
  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
  };

  // Get color based on price change
  const getChangeColor = (value: number | null) => {
    if (value === null) return '';
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  // Get background color based on predicted confidence
  const getConfidenceBackground = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    return 'bg-orange-400';
  };

  // Get mini heatmap color gradient based on change percentages
  const getMiniHeatmapStyle = (priceChangePct: number | null, volumeChangePct: number | null) => {
    const priceColor = priceChangePct === null ? '#9ca3af' : 
      priceChangePct >= 5 ? '#10b981' :
      priceChangePct >= 2 ? '#34d399' :
      priceChangePct >= 0 ? '#6ee7b7' :
      priceChangePct >= -2 ? '#fcd34d' :
      priceChangePct >= -5 ? '#f97316' : '#ef4444';
      
    const volumeColor = volumeChangePct === null ? '#9ca3af' :
      volumeChangePct >= 20 ? '#10b981' :
      volumeChangePct >= 10 ? '#34d399' :
      volumeChangePct >= 0 ? '#6ee7b7' :
      volumeChangePct >= -10 ? '#fcd34d' :
      volumeChangePct >= -20 ? '#f97316' : '#ef4444';
      
    return {
      background: `linear-gradient(135deg, ${priceColor} 0%, ${priceColor} 50%, ${volumeColor} 50%, ${volumeColor} 100%)`
    };
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Low-Cap Gems ({timeframe} timeframe)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Top promising coins with market cap $10M-$500M
        </p>
      </div>

      <div className="p-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: limit }).map((_, i) => (
            <div 
              key={`skeleton-${i}`} 
              className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="flex items-center justify-between mt-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading top picks. Please try again.
          </div>
        ) : topPicks.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No top picks available
          </div>
        ) : (
          topPicks.map(pick => (
            <div 
              key={pick.trading_pair}
              className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{pick.name}</h3>
                  <span className="ml-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                    {pick.ticker}
                  </span>
                </div>
                <div className="font-mono text-gray-800 dark:text-gray-200">
                  {pick.price ? formatPrice(pick.price) : 'N/A'}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-2">
                <span className={`text-sm font-medium ${getChangeColor(pick.timeframeChangePct)}`}>
                  {formatPercent(pick.timeframeChangePct)} ({timeframe})
                </span>
                
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Vol:</span>
                  <span className={`text-sm ml-1 ${getChangeColor(pick.volumeChangePct)}`}>
                    {formatPercent(pick.volumeChangePct)}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formatMarketCap(pick.market_cap)}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded mr-2">
                    {pick.predicted_peak_timeframe}
                  </span>
                  {pick.selection_reason}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className={`text-xs font-medium px-2 py-1 rounded text-white ${getConfidenceBackground(pick.prediction_confidence)}`}>
                  {pick.prediction_confidence}% confidence
                </div>
                
                <div 
                  className="h-6 w-6 rounded"
                  style={getMiniHeatmapStyle(pick.timeframeChangePct, pick.volumeChangePct)}
                  title={`Price: ${formatPercent(pick.timeframeChangePct)}, Volume: ${formatPercent(pick.volumeChangePct)}`}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopPicks;