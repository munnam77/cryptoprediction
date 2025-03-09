import React from 'react';
import { Target } from 'lucide-react';
import type { TimeFrame } from '../types/binance';

interface ScalpersProfitTargetProps {
  value: number;            // Profit target percentage (e.g., 5 for 5%)
  timeframe: TimeFrame;     // Time frame for the target
  className?: string;
}

/**
 * ScalpersProfitTarget Component
 * Shows predicted profit target percentage for quick scalps
 */
const ScalpersProfitTarget: React.FC<ScalpersProfitTargetProps> = ({
  value,
  timeframe,
  className = ''
}) => {
  // Get color based on value
  const getColor = () => {
    if (value >= 10) return 'text-green-500 dark:text-green-400';
    if (value >= 5) return 'text-green-400 dark:text-green-300';
    if (value >= 2) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };
  
  // Get recommendation text
  const getRecommendation = () => {
    if (value >= 10) return 'Strong Target';
    if (value >= 5) return 'Good Target';
    if (value >= 2) return 'Modest Target';
    return 'Low Target';
  };
  
  return (
    <div 
      className={`flex items-center ${className}`}
      title={`${value}% profit target predicted for ${timeframe} timeframe`}
    >
      <Target className={`w-4 h-4 mr-1 ${getColor()}`} />
      
      <div className="flex flex-col">
        <div className={`text-sm font-medium ${getColor()}`}>
          +{value}% Target
        </div>
        
        <div className="flex items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {getRecommendation()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScalpersProfitTarget;
