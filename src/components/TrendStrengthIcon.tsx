import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendStrengthIconProps {
  direction?: 'up' | 'down' | 'sideways';
  strength?: number; // 0-100
  className?: string;
}

/**
 * TrendStrengthIcon Component
 * Shows bull (green)/bear (red) with 1-3 bars indicating trend strength
 */
const TrendStrengthIcon: React.FC<TrendStrengthIconProps> = ({
  direction = 'sideways',
  strength = 0,
  className = ''
}) => {
  // Normalize strength to 0-100
  const normalizedStrength = Math.min(100, Math.max(0, strength));
  
  // Calculate number of bars (1-3) based on strength
  const getBarCount = () => {
    if (normalizedStrength >= 70) return 3;
    if (normalizedStrength >= 30) return 2;
    return 1;
  };
  
  // Get color based on direction
  const getColor = () => {
    if (direction === 'up') return 'text-green-500';
    if (direction === 'down') return 'text-red-500';
    return 'text-gray-500';
  };
  
  // Get icon based on direction
  const getIcon = () => {
    if (direction === 'up') return <TrendingUp className={`${getColor()}`} size={16} />;
    if (direction === 'down') return <TrendingDown className={`${getColor()}`} size={16} />;
    return <Minus className={`${getColor()}`} size={16} />;
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const directionText = direction === 'up' ? 'Bullish' : direction === 'down' ? 'Bearish' : 'Sideways';
    const strengthText = normalizedStrength >= 70 ? 'Strong' : normalizedStrength >= 30 ? 'Moderate' : 'Weak';
    return `${strengthText} ${directionText} Trend`;
  };
  
  return (
    <div 
      className={`flex items-center ${className} group`}
      title={getTooltip()}
    >
      {/* Icon */}
      <div className={`mr-1 ${direction === 'up' ? 'shadow-glow-green' : direction === 'down' ? 'shadow-glow-red' : ''}`}>
        {getIcon()}
      </div>
      
      {/* Strength bars */}
      <div className="flex space-x-0.5">
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            className={`w-1 h-3 rounded-sm ${
              i <= getBarCount() 
                ? getColor() 
                : 'bg-gray-700'
            }`}
          ></div>
        ))}
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
        {getTooltip()}
      </div>
    </div>
  );
};

export default TrendStrengthIcon;
