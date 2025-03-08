import React from 'react';

interface VolatilityRangeBarProps {
  volatility: number;
  high: number;
  low: number;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * VolatilityRangeBar Component
 * Displays a horizontal gradient bar showing price range (wider = higher range)
 */
const VolatilityRangeBar: React.FC<VolatilityRangeBarProps> = ({
  volatility,
  high,
  low,
  className = '',
  width = 80,
  height = 8
}) => {
  // Calculate range percentage
  const rangePercent = ((high - low) / low) * 100;
  
  // Format price based on magnitude
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${value.toFixed(2)}`;
    } else if (value >= 1) {
      return `$${value.toFixed(3)}`;
    } else if (value >= 0.01) {
      return `$${value.toFixed(4)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };
  
  // Calculate current price position within the range (0-100%)
  const pricePosition = Math.min(
    Math.max(
      ((volatility - low) / (high - low)) * 100,
      0
    ),
    100
  );
  
  return (
    <div 
      className={`relative ${className}`}
      title={`Range: ${formatPrice(low)}-${formatPrice(high)} (${rangePercent.toFixed(2)}%)`}
    >
      {/* Range bar */}
      <div 
        className="rounded-full overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div 
          className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ 
            backgroundSize: `${100 + rangePercent * 2}% 100%` 
          }}
        />
      </div>
      
      {/* Current price indicator */}
      <div 
        className="absolute top-0 w-2 h-2 bg-white border border-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: `${pricePosition}%`,
          top: `${height/2}px`
        }}
      />
      
      {/* Min price label */}
      <div className="absolute text-xs text-gray-500 dark:text-gray-400 -left-1 top-full mt-1">
        {formatPrice(low)}
      </div>
      
      {/* Max price label */}
      <div className="absolute text-xs text-gray-500 dark:text-gray-400 -right-1 top-full mt-1">
        {formatPrice(high)}
      </div>
    </div>
  );
};

export default VolatilityRangeBar;
