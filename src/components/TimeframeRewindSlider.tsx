import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeframeRewindSliderProps {
  timestamp?: number; // Current timestamp (default to now)
  maxRewind?: number; // Maximum rewind time in minutes
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onUpdate?: (rewindTimestamp: number) => void;
  className?: string;
}

/**
 * TimeframeRewindSlider Component
 * Allows users to rewind chart and data to view historical snapshots
 */
const TimeframeRewindSlider: React.FC<TimeframeRewindSliderProps> = ({
  timestamp = Date.now(),
  maxRewind = 60, // Default 60 minutes
  timeframe,
  onUpdate = () => {},
  className = ''
}) => {
  const [rewindMinutes, setRewindMinutes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Reset rewindMinutes when timeframe changes
  useEffect(() => {
    setRewindMinutes(0);
  }, [timeframe]);
  
  // Convert rewindMinutes to appropriate label
  const getRewindLabel = () => {
    if (rewindMinutes === 0) {
      return 'Current';
    }
    
    if (rewindMinutes < 60) {
      return `${rewindMinutes}m ago`;
    }
    
    const hours = Math.floor(rewindMinutes / 60);
    const mins = rewindMinutes % 60;
    
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return remainingHours > 0 ? `${days}d ${remainingHours}h ago` : `${days}d ago`;
  };
  
  // Calculate timestamp based on rewind value
  const getRewindTimestamp = () => {
    return timestamp - (rewindMinutes * 60 * 1000);
  };
  
  // Adjust max rewind based on timeframe
  const getMaxRewind = () => {
    switch (timeframe) {
      case '15m': return Math.min(maxRewind, 60); // Max 1h for 15m timeframe
      case '30m': return Math.min(maxRewind, 120); // Max 2h for 30m timeframe
      case '1h': return Math.min(maxRewind, 24 * 60); // Max 24h for 1h timeframe
      case '4h': return Math.min(maxRewind, 7 * 24 * 60); // Max 7d for 4h timeframe
      case '1d': return Math.min(maxRewind, 30 * 24 * 60); // Max 30d for 1d timeframe
      default: return maxRewind;
    }
  };
  
  // Handle slider change
  const handleRewind = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setRewindMinutes(value);
    onUpdate(getRewindTimestamp());
  };
  
  // Reset to current time
  const resetToNow = () => {
    setRewindMinutes(0);
    onUpdate(timestamp);
  };
  
  // Get appropriate color based on rewind value
  const getColor = () => {
    const percent = rewindMinutes / getMaxRewind();
    
    if (percent === 0) return '#3b82f6'; // Blue for current
    if (percent < 0.5) return '#6366f1'; // Indigo for recent history
    if (percent < 0.75) return '#8b5cf6'; // Purple for older history
    return '#a78bfa'; // Violet for oldest history
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div 
          className={`text-xs font-medium flex items-center cursor-pointer ${isActive ? 'text-blue-400' : 'text-gray-500'}`}
          onClick={() => setIsActive(!isActive)}
        >
          <Clock className="w-3 h-3 mr-1" />
          <span>Timeframe Rewind</span>
        </div>
        <div className="text-xs font-medium" style={{ color: getColor() }}>
          {getRewindLabel()}
        </div>
      </div>
      
      {isActive && (
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max={getMaxRewind()}
            value={rewindMinutes}
            onChange={handleRewind}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${getColor()}, #4b5563)`,
              accentColor: getColor()
            }}
          />
          
          {rewindMinutes > 0 && (
            <button
              onClick={resetToNow}
              className="text-xs text-blue-500 hover:text-blue-400"
              title="Reset to current time"
            >
              Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeframeRewindSlider;
