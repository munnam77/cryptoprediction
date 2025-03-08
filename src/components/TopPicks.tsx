import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, BarChart2, AlertTriangle } from 'lucide-react';
import { useBinanceData } from '../hooks/useBinanceData';

interface TopPick {
  symbol: string;
  confidence: number;
  signals: {
    rsi: number;
    macd: 'bullish' | 'bearish';
    volume: 'high' | 'medium' | 'low';
  };
  prediction: 'up' | 'down';
  price: string;
  change: string;
}

function TopPicks() {
  const { tickers, loading, error } = useBinanceData();
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);

  useEffect(() => {
    if (tickers.length > 0) {
      // Temporary mock analysis - will be replaced with real analysis
      const analyzed = tickers
        .slice(0, 5)
        .map(ticker => ({
          symbol: ticker.symbol,
          confidence: 75 + Math.floor(Math.random() * 15),
          signals: {
            rsi: 30 + Math.floor(Math.random() * 40),
            macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
            volume: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
          },
          prediction: Math.random() > 0.5 ? 'up' : 'down',
          price: ticker.lastPrice,
          change: ticker.priceChangePercent
        }))
        .sort((a, b) => b.confidence - a.confidence);

      setTopPicks(analyzed);
    }
  }, [tickers]);

  const getSignalColor = (signal: TopPick['signals']) => {
    if (signal.rsi > 70 || signal.rsi < 30) return 'text-yellow-500';
    if (signal.macd === 'bullish' && signal.volume === 'high') return 'text-green-500';
    if (signal.macd === 'bearish' && signal.volume === 'high') return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center space-x-3 mb-6">
        <Star className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold">Top Picks</h2>
      </div>

      {error ? (
        <div className="flex items-center justify-center space-x-2 text-red-500 p-4">
          <AlertTriangle className="w-5 h-5" />
          <span>Error loading top picks</span>
        </div>
      ) : loading ? (
        <div className="text-gray-400 text-center py-4">Loading top picks...</div>
      ) : (
        <div className="space-y-4">
          {topPicks.map((pick) => (
            <div
              key={pick.symbol}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">{pick.symbol.replace('USDT', '')}</span>
                  <div className={`flex items-center ${pick.prediction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${pick.prediction === 'down' ? 'transform rotate-180' : ''}`} />
                    <span className="ml-1">{Math.abs(parseFloat(pick.change)).toFixed(2)}%</span>
                  </div>
                </div>
                <span className="text-sm font-medium">${parseFloat(pick.price).toFixed(3)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className={`${getSignalColor(pick.signals)}`}>
                    <span className="mr-1">RSI</span>
                    <span>{pick.signals.rsi}</span>
                  </div>
                  <div className={pick.signals.macd === 'bullish' ? 'text-green-500' : 'text-red-500'}>
                    <span className="mr-1">MACD</span>
                    <span>{pick.signals.macd}</span>
                  </div>
                  <div className={`text-${pick.signals.volume === 'high' ? 'green' : pick.signals.volume === 'medium' ? 'yellow' : 'red'}-500`}>
                    <span className="mr-1">Vol</span>
                    <span>{pick.signals.volume}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">{pick.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopPicks;