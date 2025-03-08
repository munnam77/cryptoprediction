import React from 'react';
import { LineChart, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TechnicalIndicators } from '../services/technicalAnalysis';

interface TechnicalAnalysisProps {
  symbol: string;
  technicals: TechnicalIndicators;
  prediction: {
    direction: 'up' | 'down';
    confidence: number;
    targetPrice: number;
  };
}

function TechnicalAnalysis({ symbol, technicals, prediction }: TechnicalAnalysisProps) {
  const { rsi, macd, bollingerBands, adx, atr, roc } = technicals;

  const getTrendColor = (value: number, type: 'rsi' | 'macd' | 'momentum') => {
    switch (type) {
      case 'rsi':
        return value > 70 ? 'text-red-500' : value < 30 ? 'text-green-500' : 'text-gray-400';
      case 'macd':
        return value > 0 ? 'text-green-500' : 'text-red-500';
      case 'momentum':
        return value > 0 ? 'text-green-500' : 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LineChart className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Technical Analysis</h2>
        </div>
        <div className="flex items-center space-x-2">
          {prediction.direction === 'up' ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{prediction.confidence.toFixed(1)}% Confidence</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">RSI</div>
          <div className={`text-lg font-semibold ${getTrendColor(rsi, 'rsi')}`}>
            {rsi.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">MACD</div>
          <div className={`text-lg font-semibold ${getTrendColor(macd.histogram, 'macd')}`}>
            {macd.histogram.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Bollinger Bands</div>
          <div className="text-sm">
            <div>Upper: {bollingerBands.upper.toFixed(2)}</div>
            <div>Middle: {bollingerBands.middle.toFixed(2)}</div>
            <div>Lower: {bollingerBands.lower.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Momentum</div>
          <div className={`text-lg font-semibold ${getTrendColor(roc, 'momentum')}`}>
            {roc.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">ADX</span>
          <span className="font-medium">{adx.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">ATR</span>
          <span className="font-medium">{atr.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Target Price</span>
          <span className="font-medium">${prediction.targetPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-400">
            Signal Strength: {prediction.confidence > 80 ? 'Strong' : prediction.confidence > 60 ? 'Moderate' : 'Weak'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TechnicalAnalysis;