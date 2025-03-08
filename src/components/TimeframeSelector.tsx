import React, { useState } from 'react';
import { TimeframeOption, TIMEFRAME_OPTIONS } from '../config/database.config';

interface TimeframeSelectorProps {
  defaultTimeframe?: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  variant?: 'tabs' | 'dropdown' | 'buttons';
  className?: string;
}

/**
 * Component to select timeframe (15m, 30m, 1h, 4h, 1d)
 * Supports multiple UI variants: tabs, dropdown, or buttons
 */
const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  defaultTimeframe = '1h',
  onTimeframeChange,
  variant = 'tabs',
  className = ''
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(defaultTimeframe);

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };

  // Render as tabs (default)
  if (variant === 'tabs') {
    return (
      <div className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex overflow-x-auto">
          {TIMEFRAME_OPTIONS.map((timeframe) => (
            <button
              key={timeframe}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
                ${
                  selectedTimeframe === timeframe
                    ? 'border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => handleTimeframeChange(timeframe as TimeframeOption)}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render as dropdown
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`}>
        <select
          value={selectedTimeframe}
          onChange={(e) => handleTimeframeChange(e.target.value as TimeframeOption)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
        >
          {TIMEFRAME_OPTIONS.map((timeframe) => (
            <option key={timeframe} value={timeframe}>
              {timeframe}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Render as buttons
  return (
    <div className={`flex space-x-1 ${className}`}>
      {TIMEFRAME_OPTIONS.map((timeframe) => (
        <button
          key={timeframe}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ease-in-out
            ${
              selectedTimeframe === timeframe
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }
          `}
          onClick={() => handleTimeframeChange(timeframe as TimeframeOption)}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;