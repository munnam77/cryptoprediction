import React, { useState } from 'react';
import { Star, TrendingUp, Zap, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import type { MarketData, TimeFrame } from '../types/binance';
import VolatilityRangeBar from './VolatilityRangeBar';
import TrendStrengthIcon from './TrendStrengthIcon';
import OrderBookImbalanceTag from './OrderBookImbalanceTag';
import PricePivotDot from './PricePivotDot';
import VolatilityWaveform from './VolatilityWaveform';
import MomentumArrow from './MomentumArrow';
import SentimentPulseDot from './SentimentPulseDot';

interface TopPicksProps {
  lowCapGems: MarketData[];
  timeframe: TimeFrame;
  onCoinSelect: (coin: MarketData) => void;
  isLoading: boolean;
}

/**
 * TopPicksSection Component
 * 
 * Displays a curated selection of low-cap gems with high potential
 * Features advanced visualizations and interactive elements
 */
const TopPicksSection: React.FC<TopPicksProps> = ({
  lowCapGems,
  timeframe,
  onCoinSelect,
  isLoading
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  
  // Filter coins based on active filter
  const filteredCoins = lowCapGems.filter(coin => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bullish') return coin.priceChangePercent > 0;
    if (activeFilter === 'bearish') return coin.priceChangePercent < 0;
    return true;
  });
  
  // Format market cap to human-readable format
  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(2)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`;
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };
  
  // Format price with appropriate decimal places
  const formatPrice = (price: number): string => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toFixed(2);
  };
  
  // Render loading skeleton
  const renderSkeleton = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={index} className="bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
            <div className="ml-3">
              <div className="h-4 w-20 bg-gray-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-700 rounded mt-2"></div>
            </div>
          </div>
          <div className="h-6 w-16 bg-gray-700 rounded"></div>
        </div>
        <div className="h-2 w-full bg-gray-700 rounded mt-4"></div>
        <div className="flex justify-between mt-4">
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    ));
  };
  
  return (
    <div className="bg-crypto-dark rounded-xl shadow-crypto-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Top Picks
          </h2>
          
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'bullish' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('bullish')}
            >
              <div className="flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                Bullish
              </div>
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === 'bearish' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveFilter('bearish')}
            >
              <div className="flex items-center">
                <ArrowDown className="h-3 w-3 mr-1" />
                Bearish
              </div>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Low-cap gems with high potential based on {timeframe} timeframe
        </p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            renderSkeleton()
          ) : filteredCoins.length > 0 ? (
            filteredCoins.slice(0, 6).map((coin) => (
              <div 
                key={coin.symbol}
                className="bg-gray-800 bg-opacity-50 rounded-xl p-4 hover:bg-opacity-70 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-blue-500 hover:shadow-crypto-glow"
                onClick={() => onCoinSelect(coin)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="font-bold text-white">{coin.baseAsset.substring(0, 2)}</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold">{coin.baseAsset}</h3>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400">{formatMarketCap(coin.marketCap || 0)}</span>
                        <SentimentPulseDot value={(coin.priceChangePercent || 0) * 2} />
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                  </div>
                </div>
                
                {/* Price and volume info */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="font-medium">${formatPrice(coin.price)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Vol. Change</div>
                    <div className={`font-medium ${coin.volumeChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {coin.volumeChangePercent >= 0 ? '+' : ''}{coin.volumeChangePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* Technical indicators */}
                <div className="space-y-2">
                  {/* Volatility range bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Volatility</span>
                    <VolatilityRangeBar value={coin.volatility || 0} />
                  </div>
                  
                  {/* Trend strength */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Trend</span>
                    <div className="flex items-center space-x-2">
                      <TrendStrengthIcon 
                        direction={coin.priceChangePercent >= 0 ? 'up' : 'down'} 
                        strength={Math.min(3, Math.ceil(Math.abs(coin.priceChangePercent) / 3))}
                      />
                      <MomentumArrow value={coin.priceChangePercent} />
                    </div>
                  </div>
                  
                  {/* Order book imbalance */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Order Book</span>
                    <OrderBookImbalanceTag value={50 + (coin.priceChangePercent * 2)} />
                  </div>
                </div>
                
                {/* Prediction */}
                <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">Prediction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      coin.prediction === 'up' 
                        ? 'bg-green-500 bg-opacity-20 text-green-500' 
                        : coin.prediction === 'down' 
                          ? 'bg-red-500 bg-opacity-20 text-red-500' 
                          : 'bg-gray-500 bg-opacity-20 text-gray-400'
                    }`}>
                      {coin.prediction === 'up' ? 'Bullish' : coin.prediction === 'down' ? 'Bearish' : 'Neutral'}
                    </div>
                    <div className="text-xs font-medium">{coin.confidence || 0}%</div>
                  </div>
                </div>
                
                {/* Visual effects */}
                <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
                  <VolatilityWaveform value={coin.volatility || 0} />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
              No coins match the selected filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPicksSection; 