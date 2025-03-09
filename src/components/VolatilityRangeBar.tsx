import React from 'react';

interface VolatilityRangeBarProps {
  volatility: number; // 0-100 volatility score
  price: number;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * VolatilityRangeBar Component
 * Displays a horizontal gradient bar showing volatility intensity
 */
const VolatilityRangeBar: React.FC<VolatilityRangeBarProps> = ({
  volatility = 0,
  price = 0,
  className = '',
  width = 80,
  height = 8
}) => {
  if (!price || volatility < 0) {
    return null;
  }

  // Calculate visual range based on volatility score
  const rangePercent = volatility;
  const estimatedLow = price * (1 - (rangePercent / 200)); // Max 50% down
  const estimatedHigh = price * (1 + (rangePercent / 200)); // Max 50% up
  
  // Format price based on magnitude
  const formatPrice = (value: number | null | undefined) => {
    if (!value) return '$0.00';
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
  
  // Get color based on volatility level
  const getGradientColors = () => {
    if (volatility >= 80) return 'from-red-500 to-orange-500';
    if (volatility >= 50) return 'from-orange-500 to-yellow-500';
    if (volatility >= 30) return 'from-blue-500 to-purple-500';
    return 'from-green-500 to-blue-500';
  };

  return (
    <div 
      className={`relative ${className}`}
      title={`Volatility: ${volatility.toFixed(1)}% Range: ${formatPrice(estimatedLow)}-${formatPrice(estimatedHigh)}`}
    >
      {/* Range bar */}
      <div 
        className="rounded-full overflow-hidden bg-gray-700/30"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div 
          className={`h-full bg-gradient-to-r ${getGradientColors()} transition-all duration-500`}
          style={{ 
            width: `${Math.min(100, volatility)}%`
          }}
        />
      </div>
      
      {/* Volatility threshold markers */}
      {[30, 50, 80].map(threshold => (
        <div
          key={threshold}
          className="absolute top-0 bottom-0 w-px bg-gray-400/30"
          style={{ left: `${threshold}%` }}
        />
      ))}
    </div>
  );
};

export default VolatilityRangeBar;
