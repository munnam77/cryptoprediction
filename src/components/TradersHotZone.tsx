import React, { useState } from 'react';
import { Flame } from 'lucide-react';

interface TradersHotZoneProps {
  intensity?: number; // 0-100
  isActive?: boolean;
  onToggle?: () => void;
  className?: string;
}

/**
 * TradersHotZone Component
 * Toggleable heatmap overlay for top trading pairs
 */
const TradersHotZone: React.FC<TradersHotZoneProps> = ({
  intensity = 50,
  isActive = false,
  onToggle,
  className = ''
}) => {
  // Local state for intensity if not controlled
  const [localIntensity, setLocalIntensity] = useState(intensity);
  
  // Use provided intensity or local state
  const currentIntensity = intensity !== undefined ? intensity : localIntensity;
  
  // Handle intensity change
  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = parseInt(e.target.value, 10);
    setLocalIntensity(newIntensity);
  };
  
  // Get gradient based on intensity
  const getGradient = () => {
    const normalizedIntensity = currentIntensity / 100;
    return `linear-gradient(to bottom, rgba(255, 153, 0, ${normalizedIntensity * 0.7}), rgba(255, 51, 0, ${normalizedIntensity * 0.5}))`;
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggle}
          className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-md transition-colors
            ${isActive 
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          title="Toggle hot zone heatmap overlay"
        >
          <Flame className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-gray-500'}`} />
          <span>Hot Zone</span>
        </button>
        
        {isActive && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Intensity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={currentIntensity}
              onChange={handleIntensityChange}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        )}
      </div>
      
      {isActive && (
        <div 
          className="w-full h-20 rounded-md overflow-hidden"
          style={{ background: getGradient() }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-opacity-80 text-sm">
            Heatmap Preview
          </div>
        </div>
      )}
    </div>
  );
};

export default TradersHotZone;
