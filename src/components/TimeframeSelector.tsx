import React from 'react';

interface TimeframeSelectorProps {
  selectedTimeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onTimeframeChange: (timeframe: '15m' | '30m' | '1h' | '4h' | '1d') => void;
  timeframes: ('15m' | '30m' | '1h' | '4h' | '1d')[];
  className?: string;
}

/**
 * TimeframeSelector Component
 * Renders a tab-based selector for different timeframes as specified in context.md
 */
const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  timeframes,
  className = ''
}) => {
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
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;