import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendStrengthIconProps {
  direction: 'up' | 'down';
  strength: number; // 1-3 scale
}

/**
 * TrendStrengthIcon Component
 * 
 * Displays an icon indicating trend direction and strength
 * - Direction: up or down
 * - Strength: 1-3 scale (weak, medium, strong)
 */
const TrendStrengthIcon: React.FC<TrendStrengthIconProps> = ({ direction, strength }) => {
  // Ensure strength is within 1-3 range
  const normalizedStrength = Math.min(3, Math.max(1, strength));
  
  // Determine color based on direction and strength
  const getColor = () => {
    if (direction === 'up') {
      if (normalizedStrength === 3) return 'text-green-500';
      if (normalizedStrength === 2) return 'text-green-400';
      return 'text-green-300';
    } else {
      if (normalizedStrength === 3) return 'text-red-500';
      if (normalizedStrength === 2) return 'text-red-400';
      return 'text-red-300';
    }
  };
  
  // Determine size based on strength
  const getSize = () => {
    if (normalizedStrength === 3) return 'h-5 w-5';
    if (normalizedStrength === 2) return 'h-4 w-4';
    return 'h-3.5 w-3.5';
  };
  
  // Determine animation based on strength
  const getAnimation = () => {
    if (normalizedStrength === 3) return 'animate-pulse';
    return '';
  };
  
  return (
    <div className={`${getColor()} ${getAnimation()}`}>
      {direction === 'up' ? (
        <TrendingUp className={getSize()} />
      ) : (
        <TrendingDown className={getSize()} />
      )}
    </div>
  );
};

export default TrendStrengthIcon;
