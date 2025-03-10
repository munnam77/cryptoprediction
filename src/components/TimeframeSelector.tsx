import React from 'react';
import { Clock } from 'lucide-react';
import type { TimeFrame } from '../types/binance';

interface TimeframeSelectorProps {
  selectedTimeframe: TimeFrame;
  onChange: (timeframe: TimeFrame) => void;
}

/**
 * TimeframeSelector Component
 * 
 * Allows users to select different timeframes for market data
 */
const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onChange
}) => {
  const timeframes: TimeFrame[] = ['15m', '30m', '1h', '4h', '1d'];
  
  return (
    <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
      <div className="p-1.5 text-gray-400">
        <Clock className="h-4 w-4" />
      </div>
      
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            selectedTimeframe === timeframe
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => onChange(timeframe)}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;