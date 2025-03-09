import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import MarketMoodOrb from './MarketMoodOrb';
import BTCRippleLine from './BTCRippleLine';
import AlertSystem from './AlertSystem';

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
  marketSentiment,
  btcChangePercent,
  marketChangePercent,
  className = ''
}) => {
  // Format number with + sign for positive values
  const formatChangePercent = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-700 ${className}`}>
      {/* Left - Logo & Market Mood */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <img src="/aether-logo.svg" alt="Aether Crypto" className="h-8 w-8 mr-2" />
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Aether Crypto
          </span>
        </div>
        
        {/* Market Mood Orb */}
        <div className="flex items-center space-x-4">
          <MarketMoodOrb 
            marketSentiment={marketSentiment} 
            marketChange={marketChangePercent} 
          />
          
          {/* BTC Ripple Line */}
          <div className="flex items-center space-x-2">
            <BTCRippleLine 
              btcChangePercent={btcChangePercent}
              height={24}
            />
            <span className={`text-sm font-medium ${btcChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              BTC {formatChangePercent(btcChangePercent)}
            </span>
          </div>
          
          {/* Low-Cap Market Overview */}
          <div className="px-3 py-1 rounded-full bg-gray-800 text-sm">
            <span className="text-gray-400 mr-1">Low-Cap Market:</span>
            <span className={`${marketChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChangePercent(marketChangePercent)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Right - Settings */}
      <button 
        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings className="h-5 w-5 text-gray-400" />
      </button>
      
      {/* Smart Alert System Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-100">Smart Alerts</h2>
              <button 
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setIsSettingsOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              
            <AlertSystem />
              
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => setIsSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavigationBar;
