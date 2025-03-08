import React, { useState } from 'react';
import { LineChart } from 'lucide-react';
import { useBinanceData } from '../hooks/useBinanceData';
import TimeframeSelector from './TimeframeSelector';
import PredictionCard from './PredictionCard';

interface PredictionEngineProps {
  isRevealed: boolean;
}

function PredictionEngine({ isRevealed }: PredictionEngineProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const { tickers, loading, error } = useBinanceData();

  // Temporary mock predictions
  const mockPredictions = tickers.slice(0, 6).map(ticker => ({
    symbol: ticker.symbol,
    prediction: Math.random() > 0.5 ? 'up' : 'down',
    confidence: 70 + Math.floor(Math.random() * 20),
    price: ticker.lastPrice,
    change: ticker.priceChangePercent
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LineChart className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Prediction Engine</h2>
        </div>
        <TimeframeSelector
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />
      </div>

      {error ? (
        <div className="text-red-500 text-center py-8">
          Error loading prediction data
        </div>
      ) : loading ? (
        <div className="text-gray-400 text-center py-8">
          Loading predictions...
        </div>
      ) : !isRevealed ? (
        <div className="text-center py-12">
          <div className="text-2xl font-bold text-gray-400 mb-2">
            Predictions Locked
          </div>
          <p className="text-gray-500">
            New predictions will be revealed at 9 AM JST
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPredictions.map((pred: any) => (
            <PredictionCard
              key={pred.symbol}
              symbol={pred.symbol}
              prediction={pred.prediction}
              confidence={pred.confidence}
              price={pred.price}
              change={pred.change}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PredictionEngine;