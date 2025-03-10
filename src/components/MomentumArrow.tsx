import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface MomentumArrowProps {
  value: number; // -100 to 100 scale
}

/**
 * MomentumArrow Component
 * 
 * Displays an arrow indicating price momentum direction and strength
 * Positive values = upward momentum (green)
 * Negative values = downward momentum (red)
 * Neutral values = sideways momentum (gray)
 */
const MomentumArrow: React.FC<MomentumArrowProps> = ({ value }) => {
  // Normalize value to ensure it's within -100 to 100 range
  const normalizedValue = Math.min(100, Math.max(-100, value));
  
  // Determine icon based on momentum direction
  const renderIcon = () => {
    if (normalizedValue > 15) {
      return <TrendingUp className="text-green-500" size={18} />;
    } else if (normalizedValue < -15) {
      return <TrendingDown className="text-red-500" size={18} />;
    } else {
      return <ArrowRight className="text-gray-400" size={18} />;
    }
  };
  
  // Determine text color based on momentum
  const getTextColor = () => {
    if (normalizedValue > 15) return 'text-green-500';
    if (normalizedValue < -15) return 'text-red-500';
    return 'text-gray-400';
  };
  
  return (
    <div className="flex items-center space-x-1">
      {renderIcon()}
      <span className={`text-xs font-medium ${getTextColor()}`}>
        {normalizedValue > 0 ? '+' : ''}{Math.round(normalizedValue)}
      </span>
    </div>
  );
};

export default MomentumArrow;
