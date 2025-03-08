import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import { predictionModel } from '../services/predictionModel';
import { adaptiveLearning } from '../services/adaptiveLearning';
import LoadingSkeleton from './LoadingSkeleton';

interface TrackerData {
  symbol: string;
  prediction: {
    price: number;
    timestamp: number;
    confidence: number;
  };
  actual: {
    price: number;
    timestamp: number;
  };
  accuracy: number;
  status: 'pending' | 'success' | 'error';
}

function PredictionTracker() {
  const [trackerData, setTrackerData] = useState<TrackerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-500';
    if (accuracy >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Implement refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Prediction Tracker</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          disabled={refreshing}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {trackerData.map((data, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded-lg p-4 transition-all duration-300 hover:bg-gray-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-semibold">{data.symbol}</span>
                <span className="text-sm text-gray-400">
                  {dayjs(data.prediction.timestamp).format('HH:mm:ss')}
                </span>
              </div>
              <div className={`flex items-center space-x-2 ${getAccuracyColor(data.accuracy)}`}>
                <span className="font-medium">{data.accuracy.toFixed(1)}%</span>
                {data.prediction.price > data.actual.price ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Predicted Price</div>
                <div className="font-medium">${data.prediction.price.toFixed(4)}</div>
                <div className="text-sm text-gray-400 mt-1">
                  Confidence: {data.prediction.confidence}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Actual Price</div>
                <div className="font-medium">${data.actual.price.toFixed(4)}</div>
                <div className="text-sm text-gray-400 mt-1">
                  Updated: {dayjs(data.actual.timestamp).fromNow()}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    data.accuracy >= 90
                      ? 'bg-green-500'
                      : data.accuracy >= 70
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${data.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PredictionTracker;