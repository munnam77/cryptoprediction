import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PriceChangeIndicatorProps {
  value: number;
  percentage?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * PriceChangeIndicator Component
 * 
 * Displays a price change value with appropriate styling:
 * - Positive changes in green with up arrow
 * - Negative changes in red with down arrow
 * - Zero/neutral changes in gray with horizontal line
 */
const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({
  value,
  percentage = true,
  showIcon = true,
  className = '',
}) => {
  // Determine if change is positive, negative, or neutral
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;
  
  // Format the value
  const formattedValue = () => {
    const absValue = Math.abs(value);
    if (percentage) {
      return `${absValue.toFixed(2)}%`;
    }
    return absValue.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Determine text color based on value
  const getTextColor = () => {
    if (isPositive) return 'text-green-500';
    if (isNegative) return 'text-red-500';
    return 'text-gray-400';
  };
  
  // Get appropriate icon based on value
  const getIcon = () => {
    if (isPositive) return <ArrowUp className="h-3.5 w-3.5" />;
    if (isNegative) return <ArrowDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };
  
  return (
    <div className={`flex items-center ${getTextColor()} ${className}`}>
      {showIcon && (
        <span className="mr-1">
          {getIcon()}
        </span>
      )}
      <span className="font-medium">
        {isPositive && '+'}
        {formattedValue()}
      </span>
    </div>
  );
};

export default PriceChangeIndicator; 