import React from 'react';
import { ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react';

interface PredictionCardProps {
  symbol: string;
  prediction: 'up' | 'down';
  confidence: number;
  price: string;
  change: string;
}

function PredictionCard({ symbol, prediction, confidence, price, change }: PredictionCardProps) {
  const isUp = prediction === 'up';
  const changeNum = parseFloat(change);

  return (
    <div className="bg-gray-700 rounded-lg p-4 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold">{symbol.replace('USDT', '')}</span>
        <div className={`flex items-center ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="ml-1">{Math.abs(changeNum).toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400">Price</span>
        <span className="font-medium">${parseFloat(price).toFixed(3)}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Confidence</span>
          <span className="font-medium">{confidence}%</span>
        </div>
        <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isUp ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <button className="w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors flex items-center justify-center space-x-2">
          <BarChart2 className="w-4 h-4" />
          <span>View Analysis</span>
        </button>
      </div>
    </div>
  );
}

export default PredictionCard;