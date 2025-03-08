import React from 'react';
import { LineChart, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

interface PredictionData {
  timestamp: number;
  symbol: string;
  predicted: {
    price: number;
    direction: 'up' | 'down';
    confidence: number;
  };
  actual: {
    price: number;
    direction: 'up' | 'down';
  };
  accuracy: number;
}

interface PredictionAccuracyProps {
  predictions: PredictionData[];
  timeframe: string;
}

function PredictionAccuracy({ predictions, timeframe }: PredictionAccuracyProps) {
  const averageAccuracy = predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length;
  const successfulPredictions = predictions.filter(p => p.accuracy > 70).length;
  const successRate = (successfulPredictions / predictions.length) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LineChart className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Prediction Accuracy</h2>
        </div>
        <div className="text-sm text-gray-400">
          {timeframe} Timeframe
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Average Accuracy</div>
          <div className="text-2xl font-bold">
            {averageAccuracy.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-500">
            {successRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Predictions</div>
          <div className="text-2xl font-bold">
            {predictions.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.slice(-5).reverse().map((prediction, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-medium">{prediction.symbol}</span>
                <span className="text-sm text-gray-400">
                  {dayjs(prediction.timestamp).format('HH:mm:ss')}
                </span>
              </div>
              {prediction.accuracy > 70 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : prediction.accuracy > 50 ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Predicted</div>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${
                    prediction.predicted.direction === 'up' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    ${prediction.predicted.price.toFixed(4)}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({prediction.predicted.confidence}% confidence)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Actual</div>
                <div className={`font-medium ${
                  prediction.actual.direction === 'up'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                  ${prediction.actual.price.toFixed(4)}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-sm text-gray-400 mb-1">Accuracy</div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    prediction.accuracy > 70
                      ? 'bg-green-500'
                      : prediction.accuracy > 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${prediction.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PredictionAccuracy;