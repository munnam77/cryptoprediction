import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, Star, Search } from 'lucide-react';
import OrderBookImbalanceTag from './OrderBookImbalanceTag';
import PriceVelocityTicker from './PriceVelocityTicker';
import PumpProbabilityDial from './PumpProbabilityDial';
import CustomTriggerPin from './CustomTriggerPin';
import ScalpersCountdown from './ScalpersCountdown';

// Define the trading pair data structure
export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap?: number;
  orderBookImbalance: number; // -100 to 100
  priceVelocity: number;
  velocityTrend: 'accelerating' | 'decelerating' | 'stable';
  pumpProbability: number; // 0 to 100
  lastUpdated: number;
}

interface TradingPairTableProps {
  pairs: TradingPair[];
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onSelectPair: (symbol: string) => void;
  onCreateAlert: (alert: {
    symbol: string;
    type: string;
    condition: string;
    value: number;
    duration: number;
  }) => void;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
  className?: string;
}

/**
 * TradingPairTable Component
 * Displays a table of trading pairs with various metrics and indicators
 */
const TradingPairTable: React.FC<TradingPairTableProps> = ({
  pairs,
  timeframe,
  onSelectPair,
  onCreateAlert,
  favorites,
  onToggleFavorite,
  className = ''
}) => {
  // State for sorting and filtering
  const [sortField, setSortField] = useState<keyof TradingPair>('volume24h');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Handle sort click
  const handleSort = (field: keyof TradingPair) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Format volume with appropriate suffix (K, M, B)
  const formatVolume = (volume: number): string => {
    if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `$${(volume / 1_000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };
  
  // Filter and sort pairs
  const filteredAndSortedPairs = useMemo(() => {
    let filtered = pairs;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pair => 
        pair.symbol.toLowerCase().includes(query) ||
        pair.baseAsset.toLowerCase().includes(query) ||
        pair.quoteAsset.toLowerCase().includes(query)
      );
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(pair => favorites.includes(pair.symbol));
    }
    
    // Sort pairs
    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle special cases for sorting
      if (sortField === 'symbol') {
        aValue = a.symbol.toLowerCase();
        bValue = b.symbol.toLowerCase();
      }
      
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Compare values based on sort direction
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [pairs, sortField, sortDirection, searchQuery, showFavoritesOnly, favorites]);
  
  // Get sort icon
  const getSortIcon = (field: keyof TradingPair) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="ml-1 text-blue-400" />
      : <ChevronDown size={14} className="ml-1 text-blue-400" />;
  };
  
  // Calculate time until next update
  const getTimeUntilNextUpdate = (): number => {
    // Convert timeframe to seconds
    let timeframeInSeconds = 0;
    switch (timeframe) {
      case '15m': timeframeInSeconds = 15 * 60; break;
      case '30m': timeframeInSeconds = 30 * 60; break;
      case '1h': timeframeInSeconds = 60 * 60; break;
      case '4h': timeframeInSeconds = 4 * 60 * 60; break;
      case '1d': timeframeInSeconds = 24 * 60 * 60; break;
    }
    
    // Get most recent update time
    const mostRecentUpdate = Math.max(...pairs.map(pair => pair.lastUpdated));
    
    // Calculate time until next update
    const nextUpdateTime = mostRecentUpdate + (timeframeInSeconds * 1000);
    const timeUntilNextUpdate = Math.max(0, Math.floor((nextUpdateTime - Date.now()) / 1000));
    
    return timeUntilNextUpdate;
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Table header with search and filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center text-sm px-3 py-1.5 rounded-md ${
              showFavoritesOnly ? 'bg-yellow-800/30 text-yellow-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Star size={14} className={`mr-1.5 ${showFavoritesOnly ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
            Favorites
          </button>
          
          <ScalpersCountdown 
            seconds={getTimeUntilNextUpdate()} 
            timeframe={timeframe} 
            className="ml-2"
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-xs text-gray-400">
              <th className="px-4 py-3 text-left">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('symbol')}>
                  Pair {getSortIcon('symbol')}
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('price')}>
                  Price {getSortIcon('price')}
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('priceChange24h')}>
                  24h Change {getSortIcon('priceChange24h')}
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('volume24h')}>
                  24h Volume {getSortIcon('volume24h')}
                </div>
              </th>
              <th className="px-4 py-3 text-center">
                <div className="flex items-center justify-center cursor-pointer" onClick={() => handleSort('orderBookImbalance')}>
                  Order Book {getSortIcon('orderBookImbalance')}
                </div>
              </th>
              <th className="px-4 py-3 text-center">
                <div className="flex items-center justify-center cursor-pointer" onClick={() => handleSort('priceVelocity')}>
                  Velocity {getSortIcon('priceVelocity')}
                </div>
              </th>
              <th className="px-4 py-3 text-center">
                <div className="flex items-center justify-center cursor-pointer" onClick={() => handleSort('pumpProbability')}>
                  Pump Probability {getSortIcon('pumpProbability')}
                </div>
              </th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPairs.map((pair) => (
              <tr 
                key={pair.symbol} 
                className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => onSelectPair(pair.symbol)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Star 
                      size={16} 
                      className={`mr-2 cursor-pointer ${
                        favorites.includes(pair.symbol) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 hover:text-gray-400'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(pair.symbol);
                      }}
                    />
                    <div>
                      <div className="font-medium">{pair.baseAsset}/{pair.quoteAsset}</div>
                      <div className="text-xs text-gray-500">{pair.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatPrice(pair.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={pair.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercent(pair.priceChange24h)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {formatVolume(pair.volume24h)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <OrderBookImbalanceTag imbalance={pair.orderBookImbalance} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <PriceVelocityTicker 
                      velocity={pair.priceVelocity} 
                      trend={pair.velocityTrend} 
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <PumpProbabilityDial 
                      probability={pair.pumpProbability} 
                      timeframe={timeframe}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <CustomTriggerPin 
                      symbol={pair.symbol} 
                      onCreateAlert={(alert) => {
                        onCreateAlert(alert);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredAndSortedPairs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {searchQuery 
                    ? 'No trading pairs match your search criteria' 
                    : showFavoritesOnly 
                      ? 'No favorite trading pairs. Add some by clicking the star icon.' 
                      : 'No trading pairs available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradingPairTable; 