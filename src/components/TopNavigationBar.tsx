import React, { useState } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import MarketMoodOrb from './MarketMoodOrb';
import BTCRippleLine from './BTCRippleLine';
import AlertSystem from './AlertSystem';

interface TopNavigationBarProps {
  className?: string;
  marketSentiment: number;
  btcChangePercent: number;
  marketChangePercent: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
  progress?: number;
}

/**
 * Top Navigation Bar - Main navigation component
 * Contains Market Mood Orb, BTC Ripple Line, and other global UI elements
 */
const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  marketSentiment,
  btcChangePercent,
  marketChangePercent,
  className = '',
  onRefresh,
  isRefreshing = false,
  lastUpdated = '',
  progress = 100
}) => {
  // Format number with + sign for positive values
  const formatChangePercent = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Format time remaining for refresh
  const formatTimeRemaining = () => {
    if (progress >= 100) return 'Updated';
    const secondsRemaining = Math.ceil((progress / 100) * 30);
    return `Refresh in ${secondsRemaining}s`;
  };

  return (
    <div className={`bg-gray-900/80 backdrop-blur-md border-b border-gray-800 py-3 px-4 flex items-center justify-between sticky top-0 z-40 ${className}`}>
      {/* Left side - Logo and Market Mood */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CryptoPrediction
          </h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <MarketMoodOrb 
            marketSentiment={marketSentiment} 
            marketChange={marketChangePercent}
          />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Market Sentiment</span>
            <span className="font-medium">{marketSentiment < 40 ? 'Bearish' : marketSentiment > 60 ? 'Bullish' : 'Neutral'}</span>
          </div>
        </div>
      </div>
      
      {/* Center - BTC and Market Stats */}
      <div className="hidden lg:flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <BTCRippleLine btcChangePercent={btcChangePercent} />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">BTC/USDT</span>
            <span className={`font-medium ${btcChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChangePercent(btcChangePercent)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Market Change</span>
          <span className={`font-medium ${marketChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatChangePercent(marketChangePercent)}
          </span>
        </div>
      </div>
      
      {/* Right side - Refresh, Last Updated, Settings */}
      <div className="flex items-center space-x-4">
        {lastUpdated && (
          <div className="hidden md:flex items-center text-xs text-gray-400">
            <span className="mr-2">{formatTimeRemaining()}</span>
            <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  progress < 33 ? 'bg-red-500' : 
                  progress < 66 ? 'bg-yellow-500' : 
                  'bg-green-500'
                } ${progress < 100 ? 'animate-progress-bar-stripes' : ''}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className={`text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          title="Settings"
        >
          <Settings size={18} className="text-gray-300" />
        </button>
      </div>
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            {/* Settings content would go here */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigationBar;
