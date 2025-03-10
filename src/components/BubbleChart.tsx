import React, { useState, useEffect } from 'react';
import CryptoBubble from './CryptoBubble';
import RefreshProgressBar from './RefreshProgressBar';
import type { MarketData, TimeFrame } from '../types/binance';
import DataRefreshService from '../services/DataRefreshService';

interface BubbleChartProps {
  title?: string;
  timeframe: TimeFrame;
  onTimeframeChange?: (timeframe: TimeFrame) => void;
  onBubbleClick?: (data: MarketData) => void;
  className?: string;
}

/**
 * BubbleChart Component
 * 
 * A visually appealing chart that displays cryptocurrencies as animated bubbles
 * Inspired by cryptobubbles.net with enhanced aesthetics and animations
 */
const BubbleChart: React.FC<BubbleChartProps> = ({
  title = 'Crypto Bubbles',
  timeframe,
  onTimeframeChange,
  onBubbleClick,
  className = ''
}) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize the data refresh service
  useEffect(() => {
    const refreshService = DataRefreshService.getInstance();
    
    // Start the refresh service with the current timeframe
    refreshService.start(timeframe);
    
    // Subscribe to market data updates
    const subscription = refreshService.marketData$.subscribe(data => {
      setMarketData(data);
      setIsLoading(false);
    });
    
    // Clean up on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [timeframe]);
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
    
    // Update the refresh service with the new timeframe
    const refreshService = DataRefreshService.getInstance();
    refreshService.changeTimeframe(newTimeframe);
  };
  
  // Handle bubble click
  const handleBubbleClick = (data: MarketData) => {
    setSelectedBubble(data.symbol);
    if (onBubbleClick) {
      onBubbleClick(data);
    }
  };
  
  // Force a manual refresh
  const handleForceRefresh = () => {
    setIsLoading(true);
    const refreshService = DataRefreshService.getInstance();
    refreshService.forceRefresh();
  };
  
  // Timeframe options
  const timeframeOptions: TimeFrame[] = ['15m', '30m', '1h', '4h', '1d'];
  
  return (
    <div className={`bg-crypto-dark rounded-xl shadow-crypto-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        
        {/* Timeframe selector */}
        <div className="flex items-center space-x-2">
          {timeframeOptions.map(option => (
            <button
              key={option}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                timeframe === option
                  ? 'bg-crypto-highlight text-white'
                  : 'bg-crypto-card text-crypto-muted hover:bg-opacity-80'
              }`}
              onClick={() => handleTimeframeChange(option)}
            >
              {option}
            </button>
          ))}
          
          {/* Refresh button */}
          <button
            className="ml-2 p-1.5 rounded-full bg-crypto-card text-crypto-muted hover:text-white hover:bg-crypto-highlight transition-colors duration-200"
            onClick={handleForceRefresh}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <RefreshProgressBar />
      </div>
      
      {/* Bubbles container */}
      <div className="relative min-h-[400px] overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-highlight"></div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 p-4">
            {marketData.slice(0, 50).map((data, index) => (
              <CryptoBubble
                key={data.symbol}
                data={data}
                size={index < 10 ? 'lg' : index < 25 ? 'md' : 'sm'}
                onClick={handleBubbleClick}
                isSelected={selectedBubble === data.symbol}
              />
            ))}
          </div>
        )}
        
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-crypto-dark pointer-events-none"></div>
      </div>
    </div>
  );
};

export default BubbleChart; 