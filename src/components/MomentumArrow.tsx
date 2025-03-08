import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MomentumArrowProps {
  momentum: number; // -100 to 100
  timeframe: string;
  size?: number;
  className?: string;
}

/**
 * MomentumArrow Component
 * Directional arrow with variable size based on momentum strength
 */
const MomentumArrow: React.FC<MomentumArrowProps> = ({
  momentum,
  timeframe,
  size = 24,
  className = ''
}) => {
  // Ensure momentum is between -100 and 100
  const validMomentum = Math.min(Math.max(momentum, -100), 100);
  
  // Determine direction
  const isPositive = validMomentum >= 0;
  
  // Calculate size based on momentum strength
  const absValue = Math.abs(validMomentum);
  const scaleFactor = 0.5 + (absValue / 100) * 0.5; // Scale between 50% and 100%
  const arrowSize = size * scaleFactor;
  
  // Get color based on momentum
  const getColor = () => {
    if (isPositive) {
      if (absValue >= 70) return 'text-green-500 dark:text-green-400';
      if (absValue >= 30) return 'text-green-400 dark:text-green-300';
      return 'text-gray-400 dark:text-gray-500';
    } else {
      if (absValue >= 70) return 'text-red-500 dark:text-red-400';
      if (absValue >= 30) return 'text-red-400 dark:text-red-300';
      return 'text-gray-400 dark:text-gray-500';
    }
  };
  
  // Get glow effect based on momentum
  const getGlowEffect = () => {
    if (absValue >= 70) {
      return isPositive 
        ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
        : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    }
    if (absValue >= 50) {
      return isPositive 
        ? 'drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]' 
        : 'drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]';
    }
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let strength = '';
    
    if (absValue >= 70) strength = 'Strong';
    else if (absValue >= 30) strength = 'Moderate';
    else strength = 'Weak';
    
    const direction = isPositive ? 'bullish' : 'bearish';
    
    return `${strength} ${direction} momentum (${validMomentum.toFixed(0)}) for ${timeframe}`;
  };
  
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      title={getTooltip()}
    >
      {isPositive ? (
        <ArrowUp 
          className={`${getColor()} ${getGlowEffect()}`}
          style={{ width: `${arrowSize}px`, height: `${arrowSize}px` }}
        />
      ) : (
        <ArrowDown 
          className={`${getColor()} ${getGlowEffect()}`}
          style={{ width: `${arrowSize}px`, height: `${arrowSize}px` }}
        />
      )}
    </div>
  );
};

export default MomentumArrow;
