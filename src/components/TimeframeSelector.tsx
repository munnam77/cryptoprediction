import React from 'react';
import { Clock } from 'lucide-react';

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const timeframes = [
  { value: '1d', label: '1D' },
  { value: '4h', label: '4H' },
  { value: '1h', label: '1H' },
  { value: '15m', label: '15M' },
];

function TimeframeSelector({ selectedTimeframe, onTimeframeChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Timeframe</span>
      </div>
      <div className="flex space-x-2">
        {timeframes.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimeframeChange(value)}
            className={`
              px-4 py-2 rounded-lg transition-all duration-200
              ${selectedTimeframe === value
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimeframeSelector;