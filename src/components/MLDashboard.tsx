import React from 'react';
import { Brain, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

interface MLMetrics {
  accuracy: number;
  predictions: {
    total: number;
    correct: number;
    incorrect: number;
  };
  performance: {
    mse: number;
    mae: number;
    rmse: number;
  };
}

interface MLDashboardProps {
  metrics: MLMetrics;
  currentPrediction: {
    price: number;
    direction: 'up' | 'down';
    confidence: number;
    timestamp: number;
  };
}

function MLDashboard({ metrics, currentPrediction }: MLDashboardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-semibold">ML Predictions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Current Prediction</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Direction</span>
              <div className="flex items-center space-x-2">
                {currentPrediction.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                )}
                <span className={currentPrediction.direction === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {currentPrediction.direction.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Target Price</span>
              <span className="font-medium">${currentPrediction.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Confidence</span>
              <span className="font-medium">{currentPrediction.confidence.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  currentPrediction.confidence > 70 ? 'bg-green-500' :
                  currentPrediction.confidence > 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${currentPrediction.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Model Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Accuracy</span>
              <span className="font-medium">{metrics.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Predictions</span>
              <span className="font-medium">{metrics.predictions.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Correct</span>
              <span className="text-green-500">{metrics.predictions.correct}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Incorrect</span>
              <span className="text-red-500">{metrics.predictions.incorrect}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 col-span-2">
          <h3 className="text-lg font-medium mb-4">Error Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-gray-400 block">MSE</span>
              <span className="text-lg font-medium">{metrics.performance.mse.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-gray-400 block">MAE</span>
              <span className="text-lg font-medium">{metrics.performance.mae.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-gray-400 block">RMSE</span>
              <span className="text-lg font-medium">{metrics.performance.rmse.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {metrics.accuracy < 70 && (
        <div className="mt-6 flex items-center space-x-2 text-yellow-500">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Model accuracy below target threshold (70%)</span>
        </div>
      )}
    </div>
  );
}

export default MLDashboard;