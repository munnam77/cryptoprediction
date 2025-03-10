import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { MarketData, TimeFrame } from '../types/binance';
import SentimentPulseDot from './SentimentPulseDot';
import VolatilityRangeBar from './VolatilityRangeBar';

interface TradingPairTableProps {
  marketData: MarketData[];
  timeframe: TimeFrame;
  onCoinSelect: (coin: MarketData) => void;
  isLoading: boolean;
}

/**
 * TradingPairTable Component
 * 
 * Displays a comprehensive table of trading pairs with market data
 */
const TradingPairTable: React.FC<TradingPairTableProps> = ({
  marketData,
  timeframe,
  onCoinSelect,
  isLoading
}) => {
  // Sorting state
  const [sortField, setSortField] = useState<keyof MarketData>('volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Handle sort click
  const handleSort = (field: keyof MarketData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort data
  const sortedData = [...marketData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const compareResult = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });
  
  // Format price with appropriate precision
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(3);
    if (price >= 0.01) return price.toFixed(5);
    return price.toFixed(8);
  };
  
  // Format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1_000_000_000) return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    if (marketCap >= 1_000_000) return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  };
  
  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
    return `$${(volume / 1_000).toFixed(2)}K`;
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volatility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prediction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-crypto-dark">
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-24 bg-gray-800 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 bg-gray-800 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-16 bg-gray-800 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-24 bg-gray-800 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 bg-gray-800 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-24 bg-gray-800 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 w-20 bg-gray-800 rounded"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-800">
        <thead>
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center space-x-1">
                <span>Symbol</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center space-x-1">
                <span>Price</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('priceChangePercent')}
            >
              <div className="flex items-center space-x-1">
                <span>Change</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('volume')}
            >
              <div className="flex items-center space-x-1">
                <span>Volume</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex items-center space-x-1">
                <span>Market Cap</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('volatility')}
            >
              <div className="flex items-center space-x-1">
                <span>Volatility</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('confidence')}
            >
              <div className="flex items-center space-x-1">
                <span>Prediction</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-crypto-dark">
          {sortedData.map((coin) => (
            <tr 
              key={coin.symbol}
              className="hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => onCoinSelect(coin)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    {coin.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-medium">{coin.symbol.replace('USDT', '')}</div>
                    <div className="text-xs text-gray-400">{coin.baseAsset}/{coin.quoteAsset}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium">${formatPrice(coin.price)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`font-medium ${
                  coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium">{formatVolume(coin.volume)}</div>
                <div className="text-xs text-gray-400">
                  {coin.volumeChangePercent >= 0 ? '+' : ''}{coin.volumeChangePercent.toFixed(2)}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium">{formatMarketCap(coin.marketCap)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <VolatilityRangeBar value={coin.volatility * 100} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {coin.prediction === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                  {coin.prediction === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                  {coin.prediction === 'neutral' && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                  <span className={`font-medium ${
                    coin.prediction === 'up' ? 'text-green-500' : 
                    coin.prediction === 'down' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {coin.confidence.toFixed(0)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
          
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                No data available for {timeframe} timeframe
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TradingPairTable; 