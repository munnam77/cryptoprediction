import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { MarketData, TimeFrame } from '../types/binance';

interface MarketMoversProps {
  topGainers: MarketData[];
  timeframe: TimeFrame;
  onCoinSelect: (coin: MarketData) => void;
  isLoading: boolean;
}

/**
 * MarketMovers Component
 * 
 * Displays top gainers and losers in the market
 */
const MarketMovers: React.FC<MarketMoversProps> = ({
  topGainers,
  timeframe,
  onCoinSelect,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  
  // Sort gainers and losers
  const gainers = [...topGainers].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 5);
  const losers = [...topGainers].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, 5);
  
  // Format price with appropriate precision
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(3);
    if (price >= 0.01) return price.toFixed(5);
    return price.toFixed(8);
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-crypto-dark rounded-xl shadow-crypto-lg p-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-5 w-24 bg-gray-800 rounded"></div>
              <div className="h-5 w-16 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-crypto-dark rounded-xl shadow-crypto-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            {activeTab === 'gainers' ? (
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
            )}
            Market Movers
        </h2>
          
          {/* Tab selector */}
          <div className="flex rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === 'gainers'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('gainers')}
            >
              Gainers
            </button>
          <button
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === 'losers'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('losers')}
            >
              Losers
          </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {(activeTab === 'gainers' ? gainers : losers).map((coin) => (
            <div 
              key={coin.symbol}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => onCoinSelect(coin)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  {coin.symbol.slice(0, 1)}
                </div>
                <div>
                  <div className="font-medium">{coin.symbol.replace('USDT', '')}</div>
                  <div className="text-xs text-gray-400">${formatPrice(coin.price)}</div>
                </div>
              </div>
              
              <div className={`flex items-center ${
                coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {coin.priceChangePercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span className="font-bold">
                  {Math.abs(coin.priceChangePercent).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
          
          {(activeTab === 'gainers' ? gainers : losers).length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No data available for {timeframe} timeframe
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;