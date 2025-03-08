import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Star, Info } from 'lucide-react';
import { useBinanceData } from '../hooks/useBinanceData';
import { TimeframeData } from '../types/model';
import Tooltip from './ui/Tooltip';
import { HeatmapIndicator } from './ui/HeatmapIndicator';
import Card from './ui/Card';

interface LiveMarketTrackerProps {
  className?: string;
  onSelectSymbol?: (symbol: string) => void;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChangePercent: TimeframeData;
  volumeChangePercent: TimeframeData;
  marketCap?: number;
  volume24h: number;
  liquidityScore: number;
  volatility: TimeframeData;
  updatedAt: number;
  predictionConfidence?: number;
}

const LiveMarketTracker: React.FC<LiveMarketTrackerProps> = ({ 
  className = '',
  onSelectSymbol
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15m' | '30m' | '1h' | '4h' | '1d'>('1h');
  const [sortBy, setSortBy] = useState<keyof MarketData>('priceChangePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>([]);
  const [filterByFavorites, setFilterByFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get market data from Binance hook
  const { marketData, isLoading, lastUpdated, refreshData } = useBinanceData();
  
  // Load favorites from local storage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('cryptoPrediction_favorites');
    if (savedFavorites) {
      setFavoriteSymbols(JSON.parse(savedFavorites));
    }
  }, []);
  
  // Save favorites to local storage when they change
  useEffect(() => {
    localStorage.setItem('cryptoPrediction_favorites', JSON.stringify(favoriteSymbols));
  }, [favoriteSymbols]);

  // Toggle a symbol in favorites
  const toggleFavorite = (symbol: string) => {
    setFavoriteSymbols(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };
  
  // Handle sort toggle
  const handleSortToggle = (key: keyof MarketData) => {
    if (sortBy === key) {
      // Toggle sort order if already sorting by this key
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort key and default to descending
      setSortBy(key);
      setSortOrder('desc');
    }
  };
  
  // Sort and filter market data
  const sortedAndFilteredData = useMemo(() => {
    if (!marketData.length) return [];
    
    let filtered = marketData;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => item.symbol.toLowerCase().includes(term));
    }
    
    // Filter by favorites if enabled
    if (filterByFavorites) {
      filtered = filtered.filter(item => favoriteSymbols.includes(item.symbol));
    }
    
    // Sort data
    return [...filtered].sort((a, b) => {
      // For nested properties like priceChangePercent[selectedTimeframe]
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      // Handle nested timeframe properties
      if (sortBy === 'priceChangePercent' || sortBy === 'volumeChangePercent' || sortBy === 'volatility') {
        aValue = a[sortBy][selectedTimeframe];
        bValue = b[sortBy][selectedTimeframe];
      }
      
      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // Sort numerically
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return multiplier * (aValue - bValue);
    });
  }, [marketData, sortBy, sortOrder, selectedTimeframe, filterByFavorites, favoriteSymbols, searchTerm]);
  
  // Format last updated time
  const formatLastUpdated = (timestamp: number) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Format price based on its value
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toLocaleString(undefined, { maximumFractionDigits: 4 });
    if (price >= 0.1) return price.toLocaleString(undefined, { maximumFractionDigits: 5 });
    if (price >= 0.01) return price.toLocaleString(undefined, { maximumFractionDigits: 6 });
    return price.toLocaleString(undefined, { maximumSignificantDigits: 6 });
  };
  
  // Format volume with K, M, B suffix
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  if (isLoading && marketData.length === 0) {
    return (
      <Card className={`p-5 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded-md w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-700 rounded-md w-full"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-700/50 rounded-md w-full"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-5 ${className}`}>
      {/* Header Area */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Live Market Tracker</h2>
          <div className="flex items-center text-xs text-gray-400">
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            <button 
              onClick={refreshData} 
              className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Tooltip content="Refresh data">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </Tooltip>
            </button>
          </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-1">
          {(['15m', '30m', '1h', '4h', '1d'] as const).map(tf => (
            <button
              key={tf}
              className={`px-2 py-1 text-xs font-medium rounded ${
                selectedTimeframe === tf 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex items-center mb-4 space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>
        
        <button
          className={`flex items-center px-3 py-2 rounded-lg text-sm ${
            filterByFavorites 
              ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/40' 
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
          onClick={() => setFilterByFavorites(prev => !prev)}
        >
          <Star className="w-4 h-4 mr-1" />
          Favorites
        </button>
      </div>
      
      {/* Market Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-700">
              <th className="px-4 py-2 text-left w-8"></th>
              <th 
                className="px-4 py-2 text-left cursor-pointer hover:text-white"
                onClick={() => handleSortToggle('symbol')}
              >
                <div className="flex items-center">
                  Symbol
                  {sortBy === 'symbol' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSortToggle('price')}
              >
                <div className="flex items-center justify-end">
                  Price
                  {sortBy === 'price' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSortToggle('priceChangePercent')}
              >
                <div className="flex items-center justify-end">
                  <Tooltip content={`Price change % in ${selectedTimeframe}`}>
                    <div className="flex items-center">
                      {selectedTimeframe} Change
                      {sortBy === 'priceChangePercent' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </Tooltip>
                </div>
              </th>
              <th 
                className="px-4 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSortToggle('volume24h')}
              >
                <div className="flex items-center justify-end">
                  <Tooltip content="24-hour trading volume">
                    <div className="flex items-center">
                      Volume
                      {sortBy === 'volume24h' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </Tooltip>
                </div>
              </th>
              <th 
                className="px-4 py-2 text-right cursor-pointer hover:text-white"
                onClick={() => handleSortToggle('volumeChangePercent')}
              >
                <div className="flex items-center justify-end">
                  <Tooltip content={`Volume change % in ${selectedTimeframe}`}>
                    <div className="flex items-center">
                      Vol Chg%
                      {sortBy === 'volumeChangePercent' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </Tooltip>
                </div>
              </th>
              <th className="px-4 py-2 text-center">
                <Tooltip content="Visual representation of momentum across timeframes">
                  <div className="flex items-center justify-center">
                    Heatmap <Info className="w-3 h-3 ml-1" />
                  </div>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.length > 0 ? (
              sortedAndFilteredData.map(item => {
                const priceChange = item.priceChangePercent[selectedTimeframe] || 0;
                const volumeChange = item.volumeChangePercent[selectedTimeframe] || 0;
                
                return (
                  <tr 
                    key={item.symbol} 
                    className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
                  >
                    {/* Favorite button */}
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.symbol);
                        }}
                        className={`focus:outline-none ${favoriteSymbols.includes(item.symbol) ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-300'}`}
                      >
                        <Star className="w-4 h-4" fill={favoriteSymbols.includes(item.symbol) ? "currentColor" : "none"} />
                      </button>
                    </td>
                    
                    {/* Symbol */}
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center">
                        <span className="text-white">{item.symbol.replace('USDT', '')}</span>
                        <span className="text-gray-500 text-xs ml-1">USDT</span>
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="px-4 py-3 text-right font-mono">
                      ${formatPrice(item.price)}
                    </td>
                    
                    {/* Price Change */}
                    <td className="px-4 py-3 text-right">
                      <span className={`
                        font-medium
                        ${priceChange > 0 ? 'text-green-500' : 
                          priceChange < 0 ? 'text-red-500' : 'text-gray-400'}
                      `}>
                        {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                      </span>
                    </td>
                    
                    {/* Volume */}
                    <td className="px-4 py-3 text-right text-gray-400">
                      {formatVolume(item.volume24h)}
                    </td>
                    
                    {/* Volume Change */}
                    <td className="px-4 py-3 text-right">
                      <span className={`
                        font-medium
                        ${volumeChange > 0 ? 'text-green-500' : 
                          volumeChange < 0 ? 'text-red-500' : 'text-gray-400'}
                      `}>
                        {volumeChange > 0 ? '+' : ''}{volumeChange.toFixed(2)}%
                      </span>
                    </td>
                    
                    {/* Heatmap indicator */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <HeatmapIndicator
                          values={{
                            '15m': item.priceChangePercent['15m'] || 0,
                            '30m': item.priceChangePercent['30m'] || 0,
                            '1h': item.priceChangePercent['1h'] || 0,
                            '4h': item.priceChangePercent['4h'] || 0,
                            '1d': item.priceChangePercent['1d'] || 0,
                          }}
                          selected={selectedTimeframe}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || filterByFavorites ? 'No matching results found.' : 'No market data available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
        <div>
          Showing {sortedAndFilteredData.length} of {marketData.length} pairs
        </div>
        <div>
          Click on any row to view detailed analysis
        </div>
      </div>
    </Card>
  );
};

export default LiveMarketTracker;
