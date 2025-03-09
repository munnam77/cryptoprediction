import React, { useState } from 'react';
import { Clock, Rewind } from 'lucide-react';

interface TimeframeRewindSliderProps {
  timestamp: number;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onUpdate: (timestamp: number) => void;
  className?: string;
}

/**
 * TimeframeRewindSlider Component
 * Allows rewinding metrics to view historical data
 */
const TimeframeRewindSlider: React.FC<TimeframeRewindSliderProps> = ({
  timestamp,
  timeframe,
  onUpdate,
  className = ''
}) => {
  const [value, setValue] = useState(100); // 100 = current time, 0 = max rewind
  const [isRewinding, setIsRewinding] = useState(false);
  
  // Calculate max rewind time in milliseconds based on timeframe
  const getMaxRewindTime = (): number => {
    switch (timeframe) {
      case '15m': return 15 * 60 * 1000 * 4; // 1 hour (4 periods)
      case '30m': return 30 * 60 * 1000 * 8; // 4 hours (8 periods)
      case '1h': return 60 * 60 * 1000 * 24; // 24 hours (24 periods)
      case '4h': return 4 * 60 * 60 * 1000 * 7; // 28 hours (7 periods)
      case '1d': return 24 * 60 * 60 * 1000 * 7; // 7 days (7 periods)
      default: return 60 * 60 * 1000 * 24; // Default to 24 hours
    }
  };
  
  // Handle slider change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    
    // Calculate new timestamp
    const maxRewindTime = getMaxRewindTime();
    const rewindAmount = maxRewindTime * (1 - newValue / 100);
    const newTimestamp = Date.now() - rewindAmount;
    
    // Update parent component
    onUpdate(newTimestamp);
    
    // Set rewinding state
    setIsRewinding(newValue < 100);
  };
  
  // Format time for display
  const formatTime = () => {
    if (value === 100) return 'Current';
    
    const maxRewindTime = getMaxRewindTime();
    const rewindAmount = maxRewindTime * (1 - value / 100);
    
    if (rewindAmount < 60 * 1000) return 'Just now';
    if (rewindAmount < 60 * 60 * 1000) {
      const minutes = Math.floor(rewindAmount / (60 * 1000));
      return `${minutes}m ago`;
    }
    if (rewindAmount < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(rewindAmount / (60 * 60 * 1000));
      return `${hours}h ago`;
    }
    
    const days = Math.floor(rewindAmount / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  };
  
  // Get color based on rewind state
  const getColor = () => {
    if (!isRewinding) return 'bg-indigo-600';
    return 'bg-purple-600';
  };
  
  return (
    <div className={`relative group ${className}`}>
      <div className="flex items-center">
        {/* Rewind icon */}
        <Rewind 
          size={16} 
          className={`mr-2 ${isRewinding ? 'text-purple-400' : 'text-gray-400'}`} 
        />
        
        {/* Slider */}
        <div className="flex-1 mx-2">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleChange}
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
              isRewinding ? 'bg-purple-900/30' : 'bg-gray-700'
            }`}
            style={{
              // Custom thumb styles
              WebkitAppearance: 'none',
              appearance: 'none',
              outline: 'none',
              // Track styles
              background: `linear-gradient(to right, ${isRewinding ? '#9333ea' : '#4f46e5'} 0%, ${isRewinding ? '#9333ea' : '#4f46e5'} ${value}%, #374151 ${value}%, #374151 100%)`,
            }}
          />
        </div>
        
        {/* Time display */}
        <div className="ml-2 text-xs font-medium min-w-16 text-right">
          <span className={isRewinding ? 'text-purple-400' : 'text-gray-400'}>
            {formatTime()}
          </span>
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
        {isRewinding ? 'Historical view' : 'Current data'} ({formatTime()})
      </div>
    </div>
  );
};

export default TimeframeRewindSlider;
