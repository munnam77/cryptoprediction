import React, { useState } from 'react';
import { Settings, RefreshCw, Bell, ChevronDown, Zap, BarChart3, TrendingUp } from 'lucide-react';
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Format time remaining for refresh
  const formatTimeRemaining = () => {
    if (progress >= 100) return 'Updated';
    const secondsRemaining = Math.ceil((100 - progress) / 100 * 30);
    return `Refresh in ${secondsRemaining}s`;
  };

  // Get sentiment text and color
  const getSentimentInfo = () => {
    if (marketSentiment > 60) return { text: 'Bullish', color: 'text-green-400' };
    if (marketSentiment < 40) return { text: 'Bearish', color: 'text-red-400' };
    return { text: 'Neutral', color: 'text-yellow-400' };
  };

  const sentimentInfo = getSentimentInfo();

  return (
    <div className={`bg-gray-900/90 backdrop-blur-md border-b border-gray-800/80 py-3 px-4 flex items-center justify-between sticky top-0 z-40 shadow-lg ${className}`}>
      {/* Left side - Logo and Market Mood */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <Zap size={24} className="text-indigo-400 mr-2" />
          <h1 className="text-xl font-bold gradient-text">
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
            <span className={`font-medium ${sentimentInfo.color}`}>{sentimentInfo.text}</span>
          </div>
        </div>
      </div>
      
      {/* Center - Navigation Tabs */}
      <div className="hidden lg:flex items-center space-x-1">
        <button 
          className={`px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center ${
            activeTab === 'dashboard' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} className="mr-1.5" />
          <span>Dashboard</span>
        </button>
        
        <button 
          className={`px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center ${
            activeTab === 'predictions' ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('predictions')}
        >
          <TrendingUp size={16} className="mr-1.5" />
          <span>Predictions</span>
        </button>
      </div>
      
      {/* Right side - BTC and Market Stats, Refresh, Settings */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-4 mr-2 bg-gray-800/50 px-3 py-1.5 rounded-md">
          <div className="flex items-center space-x-2">
            <BTCRippleLine btcChangePercent={btcChangePercent} />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">BTC</span>
              <span className={`font-medium ${btcChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatChangePercent(btcChangePercent)}
              </span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-gray-700/50"></div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Market</span>
            <span className={`font-medium ${marketChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChangePercent(marketChangePercent)}
            </span>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="hidden md:flex items-center text-xs text-gray-400 bg-gray-800/30 px-2 py-1 rounded-md">
            <span className="mr-2">{formatTimeRemaining()}</span>
            <div className="w-16 h-1 bg-gray-700/70 rounded-full overflow-hidden">
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
        
        <button
          onClick={() => setIsAlertOpen(!isAlertOpen)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors relative"
          title="Alerts"
        >
          <Bell size={18} className="text-gray-300" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
        
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800/90 rounded-lg p-6 max-w-md w-full border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold gradient-text">Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            {/* Settings content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Display Settings</h3>
                <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-md">
                  <span className="text-sm">Enable Animations</span>
                  <div className="w-10 h-5 bg-gray-700 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-md">
                  <span className="text-sm">Dark Mode</span>
                  <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Notification Settings</h3>
                <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-md">
                  <span className="text-sm">Price Alerts</span>
                  <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-md">
                  <span className="text-sm">Volume Alerts</span>
                  <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
      
      {/* Alerts Dropdown */}
      {isAlertOpen && (
        <div className="absolute top-16 right-4 w-80 bg-gray-800/90 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-xl z-50 animate-fade-in">
          <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
            <h3 className="font-medium">Alerts</h3>
            <span className="text-xs text-gray-400">3 new</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-start">
                <div className="w-2 h-2 mt-1.5 bg-green-500 rounded-full mr-2"></div>
                <div>
                  <div className="text-sm font-medium">BTC breakout detected</div>
                  <div className="text-xs text-gray-400 mt-1">Price broke $60,000 resistance</div>
                  <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
                </div>
              </div>
            </div>
            <div className="p-3 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-start">
                <div className="w-2 h-2 mt-1.5 bg-orange-500 rounded-full mr-2"></div>
                <div>
                  <div className="text-sm font-medium">ETH volume surge</div>
                  <div className="text-xs text-gray-400 mt-1">Volume increased by 45% in 30m</div>
                  <div className="text-xs text-gray-500 mt-1">15 minutes ago</div>
                </div>
              </div>
            </div>
            <div className="p-3 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-start">
                <div className="w-2 h-2 mt-1.5 bg-indigo-500 rounded-full mr-2"></div>
                <div>
                  <div className="text-sm font-medium">New prediction available</div>
                  <div className="text-xs text-gray-400 mt-1">Top gainers for 4h timeframe updated</div>
                  <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 border-t border-gray-700/50">
            <button className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 py-1">
              View all alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigationBar;
