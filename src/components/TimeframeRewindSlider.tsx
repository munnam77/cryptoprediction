import React, { useState } from 'react';
import { Rewind, Play } from 'lucide-react';

interface TimeframeRewindSliderProps {
  maxRewindBars: number;
  currentRewind: number;
  onRewindChange: (bars: number) => void;
  timeframe: string;
  className?: string;
}

/**
 * TimeframeRewindSlider Component
 * Slider to rewind chart data to previous bars
 */
const TimeframeRewindSlider: React.FC<TimeframeRewindSliderProps> = ({
  maxRewindBars,
  currentRewind,
  onRewindChange,
  timeframe,
  className = ''
}) => {
  const [isRewinding, setIsRewinding] = useState(currentRewind > 0);
  
  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onRewindChange(value);
    setIsRewinding(value > 0);
  };
  
  // Handle play button click
  const handlePlayClick = () => {
    onRewindChange(0);
    setIsRewinding(false);
  };
  
  // Get tooltip text
  const getTooltip = () => {
    if (currentRewind === 0) {
      return `Current ${timeframe} data (live)`;
    } else {
      return `Rewound ${currentRewind} ${timeframe} bars into the past`;
    }
  };
  
  // Get time description based on timeframe and rewind amount
  const getTimeDescription = () => {
    if (currentRewind === 0) return 'Live';
    
    let unit = '';
    let amount = currentRewind;
    
    switch (timeframe) {
      case '1m':
        unit = amount === 1 ? 'minute' : 'minutes';
        break;
      case '5m':
        amount = amount * 5;
        unit = amount === 1 ? 'minute' : 'minutes';
        break;
      case '15m':
        amount = amount * 15;
        unit = amount === 1 ? 'minute' : 'minutes';
        break;
      case '30m':
        amount = amount * 30;
        unit = amount === 1 ? 'minute' : 'minutes';
        break;
      case '1h':
        unit = amount === 1 ? 'hour' : 'hours';
        break;
      case '4h':
        amount = amount * 4;
        unit = amount === 1 ? 'hour' : 'hours';
        break;
      case '1d':
        unit = amount === 1 ? 'day' : 'days';
        break;
      default:
        unit = 'bars';
    }
    
    return `-${amount} ${unit}`;
  };
  
  return (
    <div 
      className={`flex items-center space-x-2 ${className}`}
      title={getTooltip()}
    >
      {/* Rewind icon */}
      <Rewind 
        className={`w-4 h-4 ${isRewinding ? 'text-blue-500' : 'text-gray-400'}`} 
      />
      
      {/* Slider */}
      <input
        type="range"
        min="0"
        max={maxRewindBars}
        value={currentRewind}
        onChange={handleSliderChange}
        className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      
      {/* Play button (return to live) */}
      {isRewinding && (
        <button
          onClick={handlePlayClick}
          className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
        >
          <Play className="w-3 h-3" />
        </button>
      )}
      
      {/* Time description */}
      <span className={`text-xs font-mono ${isRewinding ? 'text-blue-500' : 'text-gray-500'}`}>
        {getTimeDescription()}
      </span>
    </div>
  );
};

export default TimeframeRewindSlider;
