import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendStrengthIconProps {
  trend: 'bull' | 'bear';
  strength: 1 | 2 | 3; // 1-3 bars of strength
  className?: string;
}

/**
 * TrendStrengthIcon Component
 * Displays a bull (green) or bear (red) icon with 1-3 bars indicating trend intensity
 */
const TrendStrengthIcon: React.FC<TrendStrengthIconProps> = ({
  trend,
  strength,
  className = ''
}) => {
  // Validate strength input
  const validStrength = Math.min(Math.max(strength, 1), 3) as 1 | 2 | 3;
  
  // Get color based on trend
  const color = trend === 'bull' ? 'text-green-500' : 'text-red-500';
  
  // Get glow intensity based on strength
  const getGlowClass = () => {
    if (validStrength === 3) return trend === 'bull' ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    if (validStrength === 2) return trend === 'bull' ? 'drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]' : 'drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const trendText = trend === 'bull' ? 'Bullish' : 'Bearish';
    const strengthText = validStrength === 3 ? 'Strong' : validStrength === 2 ? 'Moderate' : 'Weak';
    return `${strengthText} ${trendText} trend`;
  };
  
  return (
    <div 
      className={`flex items-center ${className}`}
      title={getTooltip()}
    >
      {/* Trend icon */}
      {trend === 'bull' ? (
        <TrendingUp className={`w-5 h-5 ${color} ${getGlowClass()}`} />
      ) : (
        <TrendingDown className={`w-5 h-5 ${color} ${getGlowClass()}`} />
      )}
      
      {/* Strength bars */}
      <div className="flex space-x-0.5 ml-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div 
            key={index}
            className={`
              w-1 h-3 rounded-sm
              ${index < validStrength ? color : 'bg-gray-300 dark:bg-gray-600'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendStrengthIcon;
