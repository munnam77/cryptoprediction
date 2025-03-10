import React, { useState, useEffect, useRef } from 'react';
import { subscribeToMarketData, unsubscribeFromMarketData } from '../services/BinanceService';
import type { MarketData, TimeFrame } from '../types/binance';
import { ArrowUp, ArrowDown, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Sparkles, Zap, ChevronRight, RefreshCw, TrendingDown, LineChart } from 'lucide-react';
import MomentumArrow from './MomentumArrow';
import OrderBookImbalanceTag from './OrderBookImbalanceTag';

interface PredictionDashboardProps {
  timeframe: TimeFrame;
  predictedGainers: MarketData[];
  actualGainers: MarketData[];
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
  isLoading: boolean;
}

/**
 * Prediction Dashboard Component
 * Displays predicted and actual top gainers for the selected timeframe
 */
const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  timeframe,
  predictedGainers,
  actualGainers,
  isHistoricalView = false,
  historicalTimestamp = Date.now(),
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'predictions' | 'accuracy'>('predictions');
  const [liveData, setLiveData] = useState<MarketData[]>([]);
  const [showAccuracy, setShowAccuracy] = useState<boolean>(false);
  const [animateRows, setAnimateRows] = useState<boolean>(false);
  const [isTimeframeChanging, setIsTimeframeChanging] = useState<boolean>(false);
  const prevTimeframeRef = useRef<TimeFrame>(timeframe);

  // Handle timeframe changes with animation
  useEffect(() => {
    if (prevTimeframeRef.current !== timeframe) {
      // Timeframe has changed
      setIsTimeframeChanging(true);
      
      // Animate the transition
      setTimeout(() => {
        setIsTimeframeChanging(false);
        prevTimeframeRef.current = timeframe;
      }, 500);
      
      // Reset live data when timeframe changes
      setLiveData([]);
    }
  }, [timeframe]);

  // Setup WebSocket subscription for real-time data
  useEffect(() => {
    if (isHistoricalView) return; // Don't subscribe to live data in historical view

    // Get symbols to subscribe to
    const symbols = [...new Set([
      ...predictedGainers.map(coin => coin.symbol),
      ...actualGainers.map(coin => coin.symbol)
    ])];

    // Only subscribe if we have symbols and we're not changing timeframes
    if (symbols.length > 0 && !isTimeframeChanging) {
      console.log(`Subscribing to ${symbols.length} symbols for timeframe ${timeframe}`);
      
      // Subscribe to real-time updates
      subscribeToMarketData(symbols, (updatedData) => {
        setLiveData(updatedData);
        // Trigger row animation when data updates
        setAnimateRows(true);
        setTimeout(() => setAnimateRows(false), 1000);
      });
    }

    // Cleanup subscription on unmount or timeframe change
    return () => {
      unsubscribeFromMarketData();
    };
  }, [predictedGainers, actualGainers, isHistoricalView, timeframe, isTimeframeChanging]);

  // Merge live data with predictions/actuals
  const mergeWithLiveData = (data: MarketData[]): MarketData[] => {
    if (isHistoricalView || !liveData.length) return data;

    return data.map(coin => {
      const liveInfo = liveData.find(live => live.symbol === coin.symbol);
      if (!liveInfo) return coin;

      return {
        ...coin,
        price: liveInfo.price,
        priceChangePercent: liveInfo.priceChangePercent,
        volume: liveInfo.volume,
        volumeChangePercent: liveInfo.volumeChangePercent,
        volatility: liveInfo.volatility,
      };
    });
  };

  // Format the time for header display based on timeframe
  const getHeaderTime = (): string => {
    // Use historical timestamp if in historical view mode
    const dateToUse = isHistoricalView ? new Date(historicalTimestamp) : new Date();
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZoneName: 'short' 
    };

    // Add time indication based on timeframe
    let timeStr = dateToUse.toLocaleTimeString('en-US', timeOptions);
    
    // Replace the timezone with JST for 1d timeframe as per context.md
    if (timeframe === '1d') {
      timeStr = timeStr.split(' ')[0] + ' JST';
    }
    
    return timeStr;
  };

  // Format percent values with color classes
  const formatPercentWithColor = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <span className="text-gray-400">--</span>;
    const numericValue = Number(value);
    if (isNaN(numericValue)) return <span className="text-gray-400">--</span>;
    const colorClass = numericValue >= 0 ? 'text-green-400' : 'text-red-400';
    const formatted = numericValue >= 0 ? `+${numericValue.toFixed(2)}%` : `${numericValue.toFixed(2)}%`;
    return <span className={colorClass}>{formatted}</span>;
  };

  // Update data rendering to use merged live data
  const displayPredictions = mergeWithLiveData(predictedGainers);
  const displayActuals = mergeWithLiveData(actualGainers);

  // Calculate prediction accuracy
  const calculateAccuracy = () => {
    if (!predictedGainers.length || !actualGainers.length) return 0;
    
    // Count how many predicted gainers are in the actual gainers list
    const predictedSymbols = predictedGainers.map(coin => coin.symbol);
    const actualSymbols = actualGainers.map(coin => coin.symbol);
    
    const correctPredictions = predictedSymbols.filter(symbol => actualSymbols.includes(symbol)).length;
    return (correctPredictions / predictedGainers.length) * 100;
  };

  // Get accuracy color class
  const getAccuracyColorClass = (accuracy: number): string => {
    if (accuracy >= 70) return 'text-green-400';
    if (accuracy >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get timeframe description
  const getTimeframeDescription = (): string => {
    switch (timeframe) {
      case '15m': return 'Short-term scalping';
      case '30m': return 'Quick trades';
      case '1h': return 'Hourly trends';
      case '4h': return 'Medium-term swings';
      case '1d': return 'Daily movements';
      default: return '';
    }
  };

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
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Prediction Engine
          </h2>
          
          {/* Tab selector */}
          <div className="flex rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === 'predictions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('predictions')}
            >
              Predictions
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === 'accuracy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('accuracy')}
            >
              Accuracy Metrics
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'predictions' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictedGainers.slice(0, 6).map((coin) => (
              <div 
                key={coin.symbol}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{coin.symbol.replace('USDT', '')}</h3>
                    <p className="text-sm text-gray-400">${formatPrice(coin.price)}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    coin.prediction === 'up' ? 'bg-green-500/20 text-green-400' : 
                    coin.prediction === 'down' ? 'bg-red-500/20 text-red-400' : 
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {coin.prediction === 'up' ? 'Buy' : 
                     coin.prediction === 'down' ? 'Sell' : 'Hold'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Confidence:</span>
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          coin.prediction === 'up' ? 'bg-green-500' : 
                          coin.prediction === 'down' ? 'bg-red-500' : 
                          'bg-gray-500'
                        }`}
                        style={{ width: `${coin.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{coin.confidence.toFixed(0)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Price Change:</span>
                    <span className={`text-sm font-medium ${
                      coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {coin.priceChangePercent >= 0 ? '+' : ''}{coin.priceChangePercent.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Momentum:</span>
                    <MomentumArrow value={coin.priceChangePercent * 2} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Order Book:</span>
                    <OrderBookImbalanceTag value={coin.priceChangePercent * 2} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Timeframe:</span>
                    <span className="text-sm font-medium">{timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {predictedGainers.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No predictions available for {timeframe} timeframe
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'accuracy' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accuracy metrics */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Prediction Accuracy
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Overall Accuracy:</span>
                    <span className="text-sm font-medium">{calculateAccuracy().toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${calculateAccuracy()}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Bullish Predictions:</span>
                    <span className="text-sm font-medium">
                      {predictedGainers.filter(coin => coin.prediction === 'up').length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ 
                        width: `${predictedGainers.length ? 
                          (predictedGainers.filter(coin => coin.prediction === 'up').length / predictedGainers.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Bearish Predictions:</span>
                    <span className="text-sm font-medium">
                      {predictedGainers.filter(coin => coin.prediction === 'down').length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ 
                        width: `${predictedGainers.length ? 
                          (predictedGainers.filter(coin => coin.prediction === 'down').length / predictedGainers.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Neutral Predictions:</span>
                    <span className="text-sm font-medium">
                      {predictedGainers.filter(coin => coin.prediction === 'neutral').length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500"
                      style={{ 
                        width: `${predictedGainers.length ? 
                          (predictedGainers.filter(coin => coin.prediction === 'neutral').length / predictedGainers.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance chart */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-blue-500" />
                Performance Over Time
              </h3>
              
              <div className="h-48 flex items-center justify-center border border-gray-700 rounded">
                <p className="text-gray-500">Performance chart visualization would appear here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;
