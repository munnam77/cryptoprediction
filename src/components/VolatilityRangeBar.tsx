import React from 'react';

interface VolatilityRangeBarProps {
  value: number; // 0-100 scale
}

/**
 * VolatilityRangeBar Component
 * 
 * Displays a horizontal gradient bar representing volatility
 */
const VolatilityRangeBar: React.FC<VolatilityRangeBarProps> = ({ value }) => {
  // Ensure value is within 0-100 range
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Determine color based on volatility level
  const getGradientColors = () => {
    if (normalizedValue > 75) {
      return 'from-red-500 to-orange-500'; // High volatility
    } else if (normalizedValue > 50) {
      return 'from-orange-500 to-yellow-500'; // Medium-high volatility
    } else if (normalizedValue > 25) {
      return 'from-yellow-500 to-green-500'; // Medium volatility
    } else {
      return 'from-blue-500 to-green-500'; // Low volatility
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getGradientColors()} transition-all duration-300`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <span className="text-xs font-medium">{Math.round(normalizedValue)}</span>
    </div>
  );
};

export default VolatilityRangeBar;
