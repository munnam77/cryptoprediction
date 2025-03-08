import React, { useState, useEffect } from 'react';
import TimeframeSelector from './TimeframeSelector';
import { useMarketData } from '../hooks/useMarketData';
import { TimeframeOption } from '../config/database.config';
import LoadingSkeleton from './LoadingSkeleton';

interface MarketMoversProps {
  className?: string;
}

/**
 * Enhanced MarketMovers component with multi-timeframe support
 * Shows trading pairs with price and volume changes for the selected timeframe
 */
const MarketMovers: React.FC<MarketMoversProps> = ({ className = '' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1h');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'heatmapScore', direction: 'desc' });
  
  // Fetch market data with useMarketData hook
  const {
    marketData,
    loading,
    error,
    refresh,
    sortData,
    filterData
  } = useMarketData({
    excludeTop10: true,
    timeframe: selectedTimeframe,
    limit: 100,
    refreshInterval: 60000 // 1 minute
  });

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
  };

  // Handle column sort
  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      const newDirection = 
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      
      sortData(key as any, newDirection);
      
      return {
        key,
        direction: newDirection
      };
    });
  };

  // Format percentages
  const formatPercent = (value: number | null, decimals: number = 2) => {
    if (value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  };

  // Format price
  const formatPrice = (value: number) => {
    // Format based on price magnitude
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

  // Format market cap
  const formatMarketCap = (value: number | null) => {
    if (value === null) return 'N/A';
    
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
  };

  // Generate heatmap color
  const getHeatmapColor = (score: number | null) => {
    if (score === null) return 'bg-gray-200 dark:bg-gray-700';
    
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-green-400';
    if (score >= 50) return 'bg-lime-400';
    if (score >= 40) return 'bg-yellow-300';
    if (score >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Generate price change color
  const getPriceChangeColor = (change: number | null) => {
    if (change === null) return '';
    return change >= 0 
      ? 'text-green-500 dark:text-green-400' 
      : 'text-red-500 dark:text-red-400';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Trading Pair Table
        </h2>
        <div className="flex items-center space-x-4">
          <TimeframeSelector 
            defaultTimeframe={selectedTimeframe}
            onTimeframeChange={handleTimeframeChange}
            variant="tabs"
          />
          <button
            onClick={() => refresh()}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full"
            title="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('tradingPair')}
              >
                Trading Pair
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('timeframeChangePct')}
              >
                {selectedTimeframe} Change %
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('volumeChangePct')}
              >
                Volume Change %
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('volatilityScore')}
              >
                Volatility
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('marketCap')}
              >
                Market Cap
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('liquidityScore')}
              >
                Liquidity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('predictionConfidence')}
              >
                Prediction
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('heatmapScore')}
              >
                Heatmap
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-red-500">
                  Error loading data. Please try again.
                </td>
              </tr>
            ) : marketData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              marketData.map((item) => (
                <tr 
                  key={item.tradingPair}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.tradingPair}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {formatPrice(item.price)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getPriceChangeColor(item.timeframeChangePct)}`}>
                    {formatPercent(item.timeframeChangePct)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    item.volumeChangePct === null 
                      ? 'text-gray-500 dark:text-gray-400' 
                      : item.volumeChangePct >= 0
                        ? 'text-green-500 dark:text-green-400'
                        : 'text-red-500 dark:text-red-400'
                  }`}>
                    {formatPercent(item.volumeChangePct)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.volatilityScore !== null ? item.volatilityScore.toFixed(0) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatMarketCap(item.marketCap)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.liquidityScore !== null ? item.liquidityScore.toFixed(0) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.predictionConfidence !== null ? `${item.predictionConfidence.toFixed(0)}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className={`h-6 w-6 rounded ${getHeatmapColor(item.heatmapScore)}`}
                      title={item.heatmapScore !== null ? `Heatmap score: ${item.heatmapScore}` : 'No heatmap data'}
                    ></div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketMovers;