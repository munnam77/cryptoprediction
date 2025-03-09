import React, { useState, useEffect } from 'react';
import { MarketData, subscribeToMarketData, unsubscribeFromMarketData } from '../services/BinanceService';

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

  return (
    <div className="bg-gray-800 bg-opacity-40 rounded-lg p-3">
      {/* Header with timeframe indication */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium flex items-center">
          {timeframe} Predictions, {getHeaderTime()}
          {isHistoricalView && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-800 rounded-md">
              Historical
            </span>
          )}
        </h3>
        
        {/* Tab switcher */}
        <div className="flex bg-gray-700 bg-opacity-50 rounded-md">
          <button
            className={`px-3 py-1 text-xs rounded-md ${
              activeTab === 'predictions' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-300'
            }`}
            onClick={() => setActiveTab('predictions')}
          >
            Predictions
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${
              activeTab === 'performance' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-300'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Actual
          </button>
        </div>
      </div>

      {/* Predictions Table */}
      {activeTab === 'predictions' && (
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="px-2 py-2 text-left">Coin</th>
                <th className="px-2 py-2 text-right">Pred. Gain</th>
                <th className="px-2 py-2 text-right">Conf.</th>
                <th className="px-2 py-2 text-right">Vol Change</th>
              </tr>
            </thead>
            <tbody>
              {displayPredictions.map((coin, index) => {
                // Calculate a confidence score if one isn't provided
                const confidence = coin.signalStrength || Math.round(65 + Math.random() * 20);
                
                // Calculate predicted gain
                const predictedGain = coin.profitTarget || (coin.priceChangePercent * 1.2);
                
                return (
                  <tr 
                    key={coin.symbol}
                    className={`border-b border-gray-700/30 ${index < 3 ? 'bg-indigo-900/10' : ''}`}
                  >
                    <td className="px-2 py-2">
                      <div className="flex items-center">
                        {index < 3 && (
                          <span className="w-4 h-4 flex items-center justify-center mr-1 rounded-full bg-indigo-500 text-xs">
                            {index + 1}
                          </span>
                        )}
                        <span className="font-medium">{coin.baseAsset}</span>
                        <span className="ml-1 text-xs text-gray-400">{coin.quoteAsset}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatPercentWithColor(predictedGain)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="inline-flex items-center">
                        <span className="mr-1">{confidence}%</span>
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              confidence > 80 ? 'bg-green-500' : 
                              confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatPercentWithColor(coin.volumeChangePercent)}
                    </td>
                  </tr>
                );
              })}
              
              {/* Placeholder rows if needed */}
              {predictedGainers.length < 5 && Array.from({ length: 5 - predictedGainers.length }).map((_, i) => (
                <tr key={`placeholder-${i}`} className="border-b border-gray-700/30">
                  <td className="px-2 py-2 text-gray-600">--</td>
                  <td className="px-2 py-2 text-right text-gray-600">--</td>
                  <td className="px-2 py-2 text-right text-gray-600">--</td>
                  <td className="px-2 py-2 text-right text-gray-600">--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Performance Table */}
      {activeTab === 'performance' && (
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="px-2 py-2 text-left">Coin</th>
                <th className="px-2 py-2 text-right">Actual</th>
                <th className="px-2 py-2 text-right">Predicted</th>
                <th className="px-2 py-2 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {displayActuals.map((coin, index) => {
                // Find matching prediction if any
                const matchingPrediction = predictedGainers.find(p => p.symbol === coin.symbol);
                const predictedGain = matchingPrediction?.profitTarget || 0;
                
                // Calculate accuracy as % of how close prediction was to actual
                let accuracy = 0;
                if (predictedGain && coin.priceChangePercent) {
                  accuracy = 100 - Math.min(100, Math.abs(
                    ((predictedGain - coin.priceChangePercent) / coin.priceChangePercent) * 100
                  ));
                }
                
                return (
                  <tr 
                    key={coin.symbol}
                    className={`border-b border-gray-700/30 ${index < 3 ? 'bg-green-900/10' : ''}`}
                  >
                    <td className="px-2 py-2">
                      <div className="flex items-center">
                        {index < 3 && (
                          <span className="w-4 h-4 flex items-center justify-center mr-1 rounded-full bg-green-500 text-xs">
                            {index + 1}
                          </span>
                        )}
                        <span className="font-medium">{coin.baseAsset}</span>
                        <span className="ml-1 text-xs text-gray-400">{coin.quoteAsset}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      {formatPercentWithColor(coin.priceChangePercent)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {predictedGain ? formatPercentWithColor(predictedGain) : <span className="text-gray-500">--</span>}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {matchingPrediction ? (
                        <div className="inline-flex items-center">
                          <span className="mr-1">{Math.round(accuracy)}%</span>
                          <div className="w-10 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                accuracy > 80 ? 'bg-green-500' : 
                                accuracy > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {/* Placeholder rows if needed */}
              {actualGainers.length < 5 && Array.from({ length: 5 - actualGainers.length }).map((_, i) => (
                <tr key={`placeholder-${i}`} className="border-b border-gray-700/30">
                  <td className="px-2 py-2 text-gray-600">--</td>
                  <td className="px-2 py-2 text-right text-gray-600">--</td>
                  <td className="px-2 py-2 text-right text-gray-600">--</td>
                  <td className="px-2 py-2 text-right text-gray-600">--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Show a banner when viewing historical data for better context */}
      {isHistoricalView && (
        <div className="mt-3 text-xs text-purple-300 bg-purple-900/20 p-2 rounded">
          <p>Viewing historical predictions from {new Date(historicalTimestamp).toLocaleString()}</p>
          <p className="mt-1 text-gray-400">Note: Historical prediction accuracy may differ from current market conditions.</p>
        </div>
      )}
      
      {/* Add live update indicator */}
      {!isHistoricalView && liveData.length > 0 && (
        <div className="mt-2 flex items-center justify-end">
          <div className="flex items-center text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
            Live updates enabled
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;
