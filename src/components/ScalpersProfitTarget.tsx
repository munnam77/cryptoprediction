import React from 'react';
import { Target } from 'lucide-react';

interface ScalpersProfitTargetProps {
  currentPrice: number;
  targetPrice: number;
  stopLoss?: number;
  timeframe: string;
  className?: string;
}

/**
 * ScalpersProfitTarget Component
 * Shows target price with risk/reward ratio for quick scalps
 */
const ScalpersProfitTarget: React.FC<ScalpersProfitTargetProps> = ({
  currentPrice,
  targetPrice,
  stopLoss,
  timeframe,
  className = ''
}) => {
  // Calculate percentage difference
  const percentDiff = ((targetPrice - currentPrice) / currentPrice) * 100;
  
  // Calculate risk/reward ratio if stopLoss is provided
  const riskRewardRatio = stopLoss 
    ? Math.abs((targetPrice - currentPrice) / (currentPrice - stopLoss)).toFixed(1)
    : null;
  
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
  
  // Get color based on target direction
  const getColor = () => {
    return targetPrice > currentPrice 
      ? 'text-green-500 dark:text-green-400' 
      : 'text-red-500 dark:text-red-400';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let tooltip = `Target: ${formatPrice(targetPrice)} (${percentDiff.toFixed(2)}%)`;
    
    if (stopLoss) {
      tooltip += `, Stop: ${formatPrice(stopLoss)}, R/R: ${riskRewardRatio}`;
    }
    
    tooltip += ` for ${timeframe}`;
    return tooltip;
  };
  
  return (
    <div 
      className={`flex items-center ${className}`}
      title={getTooltip()}
    >
      <Target className={`w-4 h-4 mr-1 ${getColor()}`} />
      
      <div className="flex flex-col">
        <div className={`text-sm font-medium ${getColor()}`}>
          {formatPrice(targetPrice)}
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          <span className={getColor()}>
            {percentDiff >= 0 ? '+' : ''}{percentDiff.toFixed(2)}%
          </span>
          
          {riskRewardRatio && (
            <span className="text-gray-500 dark:text-gray-400">
              R/R: {riskRewardRatio}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScalpersProfitTarget;
