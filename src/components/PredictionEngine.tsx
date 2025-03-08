import React, { useState, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import BinanceService from '../services/BinanceService';
import { MarketData } from '../services/BinanceService';
import TimeframeSelector from './TimeframeSelector';
import PredictionCard from './PredictionCard';

interface PredictionEngineProps {
  isRevealed?: boolean;
}

// Algorithm to predict price direction based on recent market data
const generatePrediction = (marketData: MarketData) => {
  // Use a combination of factors to predict direction
  const priceChangeWeight = 0.4;
  const volumeChangeWeight = 0.3;
  const volatilityWeight = 0.2;
  const liquidityWeight = 0.1;
  
  // Normalize factors to a standardized scale
  const priceChangeSignal = marketData.priceChangePercent > 0 ? 1 : -1;
  const volumeChangeSignal = marketData.volumeChangePercent > 0 ? 1 : -1;
  const volatilitySignal = (marketData.volatility || 50) > 50 ? 1 : -1;
  const liquiditySignal = (marketData.liquidity || 50) > 50 ? 1 : -1;
  
  // Calculate weighted prediction signal
  const signal = 
    priceChangeSignal * priceChangeWeight +
    volumeChangeSignal * volumeChangeWeight +
    volatilitySignal * volatilityWeight +
    liquiditySignal * liquidityWeight;
  
  // Calculate a confidence score (50-95%)
  const baseConfidence = 70;
  const confidenceBoost = Math.abs(signal) * 25;
  const confidence = Math.min(95, baseConfidence + confidenceBoost);
  
  return {
    prediction: signal > 0 ? 'up' : 'down',
    confidence: Math.round(confidence)
  };
};

function PredictionEngine({ isRevealed = true }: PredictionEngineProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15m' | '30m' | '1h' | '4h' | '1d'>('1d');
  const [allPairs, setAllPairs] = useState<MarketData[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all active USDT trading pairs from Binance
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get comprehensive market data for all USDT pairs
        const marketData = await BinanceService.getComprehensiveMarketData(selectedTimeframe);
        
        // Filter for active USDT pairs only
        const usdtPairs = marketData.filter(pair => pair.quoteAsset === 'USDT');
        
        setAllPairs(usdtPairs);
        
        // Generate predictions for pairs
        const pairsWithPredictions = usdtPairs.slice(0, 12).map(pair => {
          const { prediction, confidence } = generatePrediction(pair);
          return {
            symbol: pair.symbol,
            baseAsset: pair.baseAsset,
            prediction,
            confidence,
            price: pair.price.toString(),
            change: pair.priceChangePercent.toString()
          };
        });
        
        setPredictions(pairsWithPredictions);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching prediction data:', err);
        setError('Failed to fetch market data for predictions');
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedTimeframe]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LineChart className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Prediction Engine</h2>
        </div>
        <TimeframeSelector
          selectedTimeframe={selectedTimeframe}
          onChange={(timeframe) => setSelectedTimeframe(timeframe as '15m' | '30m' | '1h' | '4h' | '1d')}
        />
      </div>
      
      {error ? (
        <div className="text-red-500 text-center py-8">
          {error}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-4 h-[200px] loading-placeholder"></div>
          ))}
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
          {predictions.map((pred) => (
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