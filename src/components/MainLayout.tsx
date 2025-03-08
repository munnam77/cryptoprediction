import React, { useState } from 'react';
import TopNavigationBar from './TopNavigationBar';
import TopGainersCarousel from './TopGainersCarousel';
import TopPicksCarousel from './TopPicksCarousel';
import { MarketData } from '../services/BinanceService';

interface MainLayoutProps {
  marketSentiment: number;
  marketVolatility: number;
  btcChangePercent: number;
  marketChangePercent: number;
  selectedTimeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onTimeframeChange: (timeframe: '15m' | '30m' | '1h' | '4h' | '1d') => Promise<void>;
  topGainers: MarketData[];
  lowCapGems: MarketData[];
  allMarketData: MarketData[];
  isLoading: boolean;
}

/**
 * Main Layout - Overall application layout
 * Organizes all dashboard sections according to the specified design
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  marketSentiment,
  btcChangePercent,
  marketChangePercent,
  selectedTimeframe,
  onTimeframeChange,
  topGainers,
  lowCapGems,
  allMarketData,
  isLoading
}) => {
  // State for active tab in each panel
  const [tradingPairView, setTradingPairView] = useState('table');
  const [predictionView, setPredictionView] = useState('current');
  
  // Format number with + sign for positive values
  const formatChangePercent = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };
  
  // Determine color based on positive/negative value
  const getColorClass = (value: number) => {
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
  };
  
  // Timeframe options
  const timeframes = [
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' }
  ];
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gray-900 text-gray-100">
      {/* Top Navigation Bar */}
      <TopNavigationBar 
        className="sticky top-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm"
        marketSentiment={marketSentiment}
        btcChangePercent={btcChangePercent}
        marketChangePercent={marketChangePercent}
      />
      
      {/* Timeframe Selector */}
      <div className="flex justify-center items-center py-2 bg-gray-800 bg-opacity-70 border-b border-gray-700">
        <div className="flex space-x-1">
          <span className="text-sm text-gray-400 mr-2">Timeframe:</span>
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              className={`px-3 py-1 rounded text-sm ${
                selectedTimeframe === tf.value ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => onTimeframeChange(tf.value as '15m' | '30m' | '1h' | '4h' | '1d')}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-white">Loading market data...</p>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden p-4 space-x-4">
        {/* Left Panel - Trading Pair Table (30% width) */}
        <div className="w-[30%] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium">Trading Pairs</h2>
              <div className="flex space-x-2">
                <button 
                  className={`px-2 py-1 rounded text-xs ${tradingPairView === 'table' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => setTradingPairView('table')}
                >
                  Table
                </button>
                <button 
                  className={`px-2 py-1 rounded text-xs ${tradingPairView === 'grid' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => setTradingPairView('grid')}
                >
                  Grid
                </button>
              </div>
            </div>
            <div className="trading-pair-table-container p-2">
              {/* Trading Pair Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pair</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {allMarketData.slice(0, 20).map((pair) => (
                      <tr key={pair.symbol} className="hover:bg-gray-700">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="font-medium">{pair.baseAsset}</span>
                            <span className="ml-1 text-xs text-gray-400">{pair.quoteAsset}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {pair.price.toFixed(pair.price < 1 ? 6 : 2)}
                        </td>
                        <td className={`px-3 py-2 whitespace-nowrap text-right ${getColorClass(pair.priceChangePercent)}`}>
                          {formatChangePercent(pair.priceChangePercent)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          {pair.volume > 1000000 
                            ? `${(pair.volume / 1000000).toFixed(1)}M` 
                            : pair.volume > 1000 
                              ? `${(pair.volume / 1000).toFixed(1)}K` 
                              : pair.volume.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Panel - Prediction Engine (40% width) */}
        <div className="w-[40%] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium">Prediction Engine</h2>
              <div className="flex space-x-2">
                <button 
                  className={`px-2 py-1 rounded text-xs ${predictionView === 'current' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => setPredictionView('current')}
                >
                  Current
                </button>
                <button 
                  className={`px-2 py-1 rounded text-xs ${predictionView === 'history' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => setPredictionView('history')}
                >
                  History
                </button>
              </div>
            </div>
            <div className="prediction-engine-container p-4 space-y-4">
              {/* Prediction Engine Content */}
              <div className="grid grid-cols-2 gap-4">
                {allMarketData.slice(0, 4).map(coin => (
                  <div key={coin.symbol} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="font-medium">{coin.baseAsset}</span>
                        <span className="ml-1 text-xs text-gray-400">{coin.quoteAsset}</span>
                      </div>
                      <span className={`text-sm font-bold ${getColorClass(coin.priceChangePercent)}`}>
                        {formatChangePercent(coin.priceChangePercent)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span>${coin.price.toFixed(coin.price < 1 ? 6 : 2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume:</span>
                        <span>
                          {coin.volume > 1000000 
                            ? `${(coin.volume / 1000000).toFixed(1)}M` 
                            : coin.volume > 1000 
                              ? `${(coin.volume / 1000).toFixed(1)}K` 
                              : coin.volume.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volatility:</span>
                        <span>{coin.volatility?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Liquidity:</span>
                        <span>{coin.liquidity?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Top Picks & Top Gainers (30% width) */}
        <div className="w-[30%] overflow-hidden flex flex-col space-y-4">
          {/* Top Half - Top Picks Cards */}
          <div className="h-1/2 overflow-auto bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700">
            <div className="p-3 border-b border-gray-700">
              <h2 className="text-lg font-medium">Top Picks</h2>
            </div>
            <div className="top-picks-container p-2">
              {/* Top Picks Carousel */}
              <TopPicksCarousel gems={lowCapGems} />
            </div>
          </div>
          
          {/* Bottom Half - Top Gainers Cards */}
          <div className="h-1/2 overflow-auto bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700">
            <div className="p-3 border-b border-gray-700">
              <h2 className="text-lg font-medium">Top Gainers</h2>
            </div>
            <div className="top-gainers-container p-2">
              {/* Top Gainers Carousel */}
              <TopGainersCarousel gainers={topGainers} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - System Status */}
      <div className="h-6 bg-gray-900 bg-opacity-70 text-xs text-gray-500 p-1 px-4 flex items-center justify-between">
        <div>Data refresh: Auto (60s)</div>
        <div> 2025 CryptoEdge</div>
        <div>v1.0.0</div>
      </div>
    </div>
  );
};

export default MainLayout;
