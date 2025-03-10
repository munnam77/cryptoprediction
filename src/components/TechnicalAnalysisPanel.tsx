import React from 'react';
import { LineChart, BarChart, CandlestickChart, Activity } from 'lucide-react';
import type { MarketData, TimeFrame } from '../types/binance';

interface TechnicalAnalysisPanelProps {
  selectedCoin: MarketData | null;
  timeframe: TimeFrame;
  isLoading: boolean;
}

/**
 * TechnicalAnalysisPanel Component
 * 
 * Displays technical analysis tools and indicators for the selected coin
 */
const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({
  selectedCoin,
  timeframe,
  isLoading
}) => {
  // If no coin is selected, show a placeholder
  if (!selectedCoin && !isLoading) {
    return (
      <div className="bg-crypto-dark rounded-xl shadow-crypto-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CandlestickChart className="h-16 w-16 text-gray-600" />
          <h3 className="text-xl font-medium text-gray-400">Select a coin to view technical analysis</h3>
          <p className="text-gray-500 max-w-md">
            Choose any cryptocurrency from the market overview to see detailed technical indicators and chart patterns.
          </p>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-crypto-dark rounded-xl shadow-crypto-lg p-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-800 rounded mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-800 rounded"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-crypto-dark rounded-xl shadow-crypto-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Technical Analysis: {selectedCoin?.symbol}
          </h2>
          
          {/* Indicator selector */}
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm bg-blue-600 rounded-md font-medium">
              Oscillators
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-md font-medium">
              Moving Averages
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-md font-medium">
              Patterns
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart panel */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Price Chart ({timeframe})</h3>
              <div className="flex space-x-2">
                <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700">
                  <LineChart className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700">
                  <BarChart className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1.5 rounded bg-blue-600">
                  <CandlestickChart className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            
            {/* Chart placeholder */}
            <div className="h-64 border border-gray-800 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would appear here</p>
            </div>
          </div>
          
          {/* Indicators panel */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-medium mb-4">Technical Indicators</h3>
            
            <div className="space-y-4">
              {/* RSI */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">RSI (14)</span>
                  <span className="text-sm font-bold text-orange-500">58.24</span>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '58.24%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Oversold</span>
                  <span>Neutral</span>
                  <span>Overbought</span>
                </div>
              </div>
              
              {/* MACD */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">MACD (12,26,9)</span>
                  <span className="text-sm font-bold text-green-500">Bullish</span>
                </div>
                <div className="mt-2 flex space-x-1">
                  <div className="h-4 bg-green-500 w-2"></div>
                  <div className="h-4 bg-green-500 w-2"></div>
                  <div className="h-4 bg-green-500 w-2"></div>
                  <div className="h-4 bg-red-500 w-2"></div>
                  <div className="h-4 bg-red-500 w-2"></div>
                  <div className="h-4 bg-green-500 w-2"></div>
                  <div className="h-4 bg-green-500 w-2"></div>
                  <div className="h-4 bg-green-500 w-2"></div>
                </div>
              </div>
              
              {/* Bollinger Bands */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Bollinger Bands (20,2)</span>
                  <span className="text-sm font-bold text-blue-500">Squeeze</span>
                </div>
                <div className="mt-2 relative h-6 bg-gray-700 rounded-lg overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-blue-500/10"></div>
                  <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-white"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* More indicators would be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisPanel; 