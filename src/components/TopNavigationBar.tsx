import React from 'react';
import { Settings, Bell, Search } from 'lucide-react';

interface TopNavigationBarProps {
  className?: string;
  marketSentiment: number;
  btcChangePercent: number;
  marketChangePercent: number;
}

/**
 * Top Navigation Bar - Main navigation component
 * Contains Market Mood Orb, BTC Ripple Line, and other global UI elements
 */
const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  className = '',
  marketSentiment,
  btcChangePercent,
  marketChangePercent
}) => {
  // Get market mood color based on sentiment value
  const getMoodColor = (sentiment: number) => {
    if (sentiment >= 67) return 'bg-gradient-to-br from-green-400 to-green-600';
    if (sentiment >= 34) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-br from-red-400 to-red-600';
  };
  
  // Format number with + sign for positive values
  const formatChangePercent = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };
  
  // Determine color based on positive/negative value
  const getColorClass = (value: number) => {
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
  };
  
  return (
    <header className={`py-2 px-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Logo & Market Mood */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/aether-logo.svg" alt="Aether" className="w-6 h-6 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Aether</span>
            <span className="text-xl font-bold text-gray-200">Crypto</span>
          </div>
          
          {/* Market Mood Orb */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getMoodColor(marketSentiment)} shadow-glow animate-pulse`} />
            <span className="text-sm text-gray-400">Market Mood</span>
            <span className="text-sm font-semibold">
              {marketSentiment < 34 ? 'Bearish' : marketSentiment < 67 ? 'Neutral' : 'Bullish'}
            </span>
          </div>
          
          {/* BTC Change */}
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-1">BTC</span>
            <span className={`text-sm font-semibold ${getColorClass(btcChangePercent)}`}>
              {formatChangePercent(btcChangePercent)}
            </span>
          </div>
          
          {/* Market Change */}
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-1">Market</span>
            <span className={`text-sm font-semibold ${getColorClass(marketChangePercent)}`}>
              {formatChangePercent(marketChangePercent)}
            </span>
          </div>
        </div>
        
        {/* Right: Search & Icons */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search assets..."
              className="bg-gray-700 text-sm text-gray-300 rounded-md py-1.5 pl-8 pr-3 w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-gray-800 transition-colors"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Notification Bell */}
          <button className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500" />
          </button>
          
          {/* Settings */}
          <button className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm cursor-pointer">
            AC
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigationBar;
