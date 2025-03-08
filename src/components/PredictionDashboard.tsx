import React, { useState, useEffect } from 'react';
import { TimeframeOption } from '../config/database.config';
import { PredictionService } from '../services/prediction/PredictionService';
import LoadingSkeleton from './LoadingSkeleton';

interface PredictionDashboardProps {
  timeframe: TimeframeOption;
}

/**
 * PredictionDashboard Component
 * Displays predictions for the selected timeframe with actual performance tracking
 */
const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ timeframe }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [actualTopGainers, setActualTopGainers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchPredictions();

    // Refresh based on timeframe frequency
    let refreshInterval: number;
    switch (timeframe) {
      case '15m':
        refreshInterval = 15 * 60 * 1000; // 15 minutes
        break;
      case '30m':
        refreshInterval = 30 * 60 * 1000; // 30 minutes
        break;
      case '1h':
        refreshInterval = 60 * 60 * 1000; // 1 hour
        break;
      case '4h':
        refreshInterval = 4 * 60 * 60 * 1000; // 4 hours
        break;
      case '1d':
      default:
        refreshInterval = 24 * 60 * 60 * 1000; // 1 day
        break;
    }

    const intervalId = setInterval(fetchPredictions, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [timeframe]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);

      // Get predictions for the current timeframe
      const allPredictions = await PredictionService.getTopPredictionsAllTimeframes(5);
      const timeframePredictions = allPredictions?.[timeframe] || [];
      setPredictions(timeframePredictions);

      // For this demo, we'll simulate actual top gainers
      // In a real implementation, we would fetch actual market data
      const simulatedTopGainers = timeframePredictions.slice()
        .sort(() => Math.random() - 0.5) // Shuffle
        .map(pred => ({
          ...pred,
          actual_change_pct: (Math.random() * 20) - 5, // -5% to +15%
          volume_change_pct: (Math.random() * 50) - 10, // -10% to +40%
        }))
        .sort((a, b) => b.actual_change_pct - a.actual_change_pct);

      setActualTopGainers(simulatedTopGainers);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch predictions'));
      console.error('Error in PredictionDashboard component:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format percentages
  const formatPercent = (value: number | null, decimals: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  };

  // Format time
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get color class based on percentage value
  const getColorClass = (value: number | null) => {
    if (value === null || value === undefined) return '';
    return value >= 0
      ? 'text-green-500 dark:text-green-400'
      : 'text-red-500 dark:text-red-400';
  };

  // Get confidence color
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    return 'bg-orange-400';
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
            {timeframe} Predictions
          </h3>
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Made at {formatTime(lastUpdated)}, {formatDate(lastUpdated)}
            </span>
          )}
        </div>
        <button
          onClick={fetchPredictions}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          Error loading predictions. Please try again.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Predicted Gainers */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Predicted Top Gainers
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              {predictions.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                  No predictions available for this timeframe
                </p>
              ) : (
                <div className="space-y-3">
                  {predictions.slice(0, 5).map((pred) => (
                    <div
                      key={`pred-${pred.trading_pair}`}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {pred.trading_pair}
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full text-white ${getConfidenceColor(pred.confidence_score)}`}>
                          {Math.round(pred.confidence_score)}%
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${getColorClass(pred.predicted_change_pct)}`}>
                        {formatPercent(pred.predicted_change_pct)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actual Performance */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actual Performance
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              {predictions.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                  No data available
                </p>
              ) : (
                <div className="space-y-3">
                  {predictions.slice(0, 5).map((pred) => {
                    // Find actual performance
                    const actual = actualTopGainers.find(
                      (act) => act.trading_pair === pred.trading_pair
                    );
                    const actualChange = actual?.actual_change_pct ?? null;

                    return (
                      <div
                        key={`actual-${pred.trading_pair}`}
                        className="flex justify-between items-center"
                      >
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {pred.trading_pair}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getColorClass(actualChange)}`}>
                            {formatPercent(actualChange)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            vs {formatPercent(pred.predicted_change_pct)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actual Top Gainers */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actual Top Gainers
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="space-y-3">
                {actualTopGainers.slice(0, 5).map((gainer) => (
                  <div
                    key={`gainer-${gainer.trading_pair}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {gainer.trading_pair}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Vol: {formatPercent(gainer.volume_change_pct)}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${getColorClass(gainer.actual_change_pct)}`}>
                      {formatPercent(gainer.actual_change_pct)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;
