import React, { useState } from 'react';
import { PlayCircle, PauseCircle, SkipForward, RotateCcw } from 'lucide-react';

interface BacktestResult {
  timestamp: number;
  prediction: {
    price: number;
    direction: 'up' | 'down';
    confidence: number;
  };
  actual: {
    price: number;
    direction: 'up' | 'down';
  };
  success: boolean;
}

interface BacktestingEngineProps {
  historicalData: {
    timestamp: number;
    price: number;
    volume: number;
  }[];
  onBacktestComplete: (results: BacktestResult[]) => void;
}

function BacktestingEngine({ historicalData, onBacktestComplete }: BacktestingEngineProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [results, setResults] = useState<BacktestResult[]>([]);

  const toggleBacktest = () => {
    setIsRunning(!isRunning);
  };

  const resetBacktest = () => {
    setIsRunning(false);
    setProgress(0);
    setResults([]);
  };

  const skipForward = () => {
    setProgress(Math.min(progress + 10, 100));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Backtesting Engine</h2>
        <div className="flex items-center space-x-4">
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-gray-700 rounded-lg px-3 py-1"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
          <button
            onClick={toggleBacktest}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isRunning ? (
              <PauseCircle className="w-6 h-6 text-yellow-500" />
            ) : (
              <PlayCircle className="w-6 h-6 text-green-500" />
            )}
          </button>
          <button
            onClick ={skipForward}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <SkipForward className="w-6 h-6 text-blue-500" />
          </button>
          <button
            onClick={resetBacktest}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-6 h-6 text-red-500" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Results Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Trades</span>
                <span>{results.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-green-500">
                  {results.length > 0
                    ? ((results.filter(r => r.success).length / results.length) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Confidence</span>
                <span>
                  {results.length > 0
                    ? (results.reduce((acc, r) => acc + r.prediction.confidence, 0) / results.length).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Latest Predictions</h3>
            <div className="space-y-2">
              {results.slice(-3).map((result, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className={result.success ? 'text-green-500' : 'text-red-500'}>
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`text-${result.prediction.direction === 'up' ? 'green' : 'red'}-500`}>
                      {result.prediction.direction === 'up' ? '↑' : '↓'}
                    </span>
                  </div>
                  <span className="font-medium">${result.prediction.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BacktestingEngine;