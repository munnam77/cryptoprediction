import React, { useState, useEffect } from 'react';
import { subscribeToMarketData, unsubscribeFromMarketData } from '../services/BinanceService';
import type { MarketData } from '../types/binance';
import { ArrowUp, ArrowDown, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface PredictionDashboardProps {
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  predictedGainers: MarketData[];
  actualGainers: MarketData[];
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
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
  historicalTimestamp = Date.now()
}) => {
  const [activeTab, setActiveTab] = useState<'predictions' | 'performance'>('predictions');
  const [liveData, setLiveData] = useState<MarketData[]>([]);
  const [showAccuracy, setShowAccuracy] = useState<boolean>(false);

  // Setup WebSocket subscription for real-time data
  useEffect(() => {
    if (isHistoricalView) return; // Don't subscribe to live data in historical view

    // Get symbols to subscribe to
    const symbols = [...new Set([
      ...predictedGainers.map(coin => coin.symbol),
      ...actualGainers.map(coin => coin.symbol)
    ])];

    // Subscribe to real-time updates
    subscribeToMarketData(symbols, (updatedData) => {
      setLiveData(updatedData);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromMarketData();
    };
  }, [predictedGainers, actualGainers, isHistoricalView]);

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
  const calculateAccuracy = (): number => {
    if (!predictedGainers.length || !actualGainers.length) return 0;
    
    // Count how many predicted coins are in the actual top gainers
    const correctPredictions = predictedGainers.filter(predicted => 
      actualGainers.some(actual => actual.symbol === predicted.symbol)
    ).length;
    
    return (correctPredictions / predictedGainers.length) * 100;
  };

  // Get accuracy color class
  const getAccuracyColorClass = (accuracy: number): string => {
    if (accuracy >= 70) return 'text-green-400';
    if (accuracy >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Render the predictions table
  const renderPredictionsTable = () => {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-700/50">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gray-800/70">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Coin
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Predicted %
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Confidence
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Vol Change %
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700/30">
            {displayPredictions.length > 0 ? (
              displayPredictions.map((coin, index) => {
                const baseAsset = coin.symbol.replace('USDT', '');
                return (
                  <tr key={coin.symbol} className={index % 2 === 0 ? 'bg-gray-800/10' : 'bg-gray-800/20'}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white">{baseAsset}</div>
                        <div className="ml-2">
                          {coin.volatility && coin.volatility > 80 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-900/50 text-orange-200">
                              High Vol
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      ${coin.price.toFixed(coin.price < 1 ? 6 : 2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end">
                        {formatPercentWithColor(coin.priceChangePercent)}
                        {Math.abs(coin.priceChangePercent) > 10 && (
                          <span className="ml-1">
                            {coin.priceChangePercent > 0 ? 
                              <ArrowUp size={14} className="text-green-400" /> : 
                              <ArrowDown size={14} className="text-red-400" />
                            }
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${
                            coin.pumpProbability && coin.pumpProbability > 70 ? 'bg-green-500' : 
                            coin.pumpProbability && coin.pumpProbability > 50 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${coin.pumpProbability || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1 text-gray-400">
                        {coin.pumpProbability ? `${Math.round(coin.pumpProbability)}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {formatPercentWithColor(coin.volumeChangePercent)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-400">
                  No predictions available for this timeframe
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render the performance table (actual gainers)
  const renderPerformanceTable = () => {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-700/50">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead className="bg-gray-800/70">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Coin
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actual %
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Vol Change %
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Predicted
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700/30">
            {displayActuals.length > 0 ? (
              displayActuals.map((coin, index) => {
                const baseAsset = coin.symbol.replace('USDT', '');
                const wasPredicted = predictedGainers.some(predicted => predicted.symbol === coin.symbol);
                
                return (
                  <tr key={coin.symbol} className={index % 2 === 0 ? 'bg-gray-800/10' : 'bg-gray-800/20'}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white">{baseAsset}</div>
                        {index === 0 && (
                          <div className="ml-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-200">
                              Top Gainer
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      ${coin.price.toFixed(coin.price < 1 ? 6 : 2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end">
                        {formatPercentWithColor(coin.priceChangePercent)}
                        {Math.abs(coin.priceChangePercent) > 10 && (
                          <span className="ml-1">
                            {coin.priceChangePercent > 0 ? 
                              <ArrowUp size={14} className="text-green-400" /> : 
                              <ArrowDown size={14} className="text-red-400" />
                            }
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {formatPercentWithColor(coin.volumeChangePercent)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {wasPredicted ? (
                        <CheckCircle size={16} className="inline-block text-green-400" />
                      ) : (
                        <AlertTriangle size={16} className="inline-block text-yellow-400" />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-400">
                  No actual gainers data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Calculate accuracy
  const accuracy = calculateAccuracy();

  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gray-800/70 px-4 py-3 flex justify-between items-center border-b border-gray-700/50">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-white">{timeframe} Predictions</h3>
          <div className="ml-3 flex items-center text-sm text-gray-400">
            <Clock size={14} className="mr-1" />
            <span>{getHeaderTime()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Accuracy Badge */}
          <button 
            className="flex items-center px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setShowAccuracy(!showAccuracy)}
            title="Toggle accuracy display"
          >
            <BarChart3 size={14} className="mr-1 text-indigo-400" />
            <span className="text-xs">Accuracy</span>
          </button>
          
          {/* Tab Buttons */}
          <div className="flex rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === 'predictions' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('predictions')}
            >
              <div className="flex items-center">
                <TrendingUp size={14} className="mr-1" />
                <span>Predictions</span>
              </div>
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === 'performance' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('performance')}
            >
              <div className="flex items-center">
                <CheckCircle size={14} className="mr-1" />
                <span>Actuals</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Accuracy Display */}
      {showAccuracy && (
        <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Prediction Accuracy
            </div>
            <div className={`text-sm font-medium ${getAccuracyColorClass(accuracy)}`}>
              {accuracy.toFixed(0)}%
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full ${
                accuracy >= 70 ? 'bg-green-500' : 
                accuracy >= 50 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'predictions' ? renderPredictionsTable() : renderPerformanceTable()}
      </div>
    </div>
  );
};

export default PredictionDashboard;
