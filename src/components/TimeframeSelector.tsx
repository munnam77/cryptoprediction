import React from 'react';
import { TimeFrame } from '../types/binance';

interface TimeframeSelectorProps {
  selectedTimeframe: TimeFrame;
  onTimeframeChange: (timeframe: TimeFrame) => void;
  timeframes: TimeFrame[];
  className?: string;
}

/**
 * TimeframeSelector Component
 * Renders a tab-based selector for different timeframes
 */
const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  timeframes,
  className = ''
}) => {
  // Map of timeframe labels for display
  const timeframeLabels: Record<TimeFrame, string> = {
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d'
  };

  return (
    <div className={`inline-flex bg-gray-700 bg-opacity-50 rounded-md ${className}`}>
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={`px-3 py-1 text-xs rounded-md transition-colors duration-200 ${
            selectedTimeframe === timeframe 
              ? 'bg-indigo-600 text-white border-2 border-indigo-400' 
              : 'text-gray-300 hover:bg-gray-600'
          }`}
          title={`Switch to ${timeframeLabels[timeframe]} timeframe`}
        >
          {timeframeLabels[timeframe]}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;