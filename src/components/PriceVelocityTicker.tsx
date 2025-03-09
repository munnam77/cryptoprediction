import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface PriceVelocityTickerProps {
  velocity: number; // Price change rate per timeframe
  trend: 'accelerating' | 'decelerating' | 'stable';
  className?: string;
}

/**
 * PriceVelocityTicker Component
 * Shows a scrolling bar indicating price velocity (speed of price change)
 */
const PriceVelocityTicker: React.FC<PriceVelocityTickerProps> = ({
  velocity,
  trend,
  className = ''
}) => {
  // Determine if velocity is positive or negative
  const isPositive = velocity > 0;
  const isNegative = velocity < 0;
  const isNeutral = velocity === 0;
  
  // Get absolute value for display
  const absVelocity = Math.abs(velocity);
  
  // Format velocity for display
  const formatVelocity = () => {
    if (absVelocity < 0.001) return '0.000';
    if (absVelocity < 1) return absVelocity.toFixed(4);
    if (absVelocity < 10) return absVelocity.toFixed(3);
    if (absVelocity < 100) return absVelocity.toFixed(2);
    return absVelocity.toFixed(1);
  };
  
  // Get color based on velocity and trend
  const getColor = () => {
    if (isNeutral) return 'text-gray-400 bg-gray-700';
    
    if (isPositive) {
      if (trend === 'accelerating') return 'text-green-300 bg-green-900/30';
      if (trend === 'decelerating') return 'text-green-400 bg-green-900/20';
      return 'text-green-400 bg-green-900/10';
    }
    
    if (isNegative) {
      if (trend === 'accelerating') return 'text-red-300 bg-red-900/30';
      if (trend === 'decelerating') return 'text-red-400 bg-red-900/20';
      return 'text-red-400 bg-red-900/10';
    }
    
    return 'text-gray-400 bg-gray-700';
  };
  
  // Get icon based on velocity and trend
  const getIcon = () => {
    if (isNeutral) return <ArrowRight size={14} />;
    
    if (isPositive) {
      return <TrendingUp size={14} />;
    }
    
    if (isNegative) {
      return <TrendingDown size={14} />;
    }
    
    return <ArrowRight size={14} />;
  };
  
  // Get animation speed based on velocity
  const getAnimationSpeed = () => {
    if (absVelocity < 0.001) return 'animate-none';
    if (absVelocity < 0.01) return 'animate-scroll-slow';
    if (absVelocity < 0.1) return 'animate-scroll';
    return 'animate-scroll-fast';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const directionText = isPositive ? 'upward' : isNegative ? 'downward' : 'stable';
    const trendText = trend === 'accelerating' ? 'accelerating' : trend === 'decelerating' ? 'decelerating' : 'stable';
    return `${directionText} price movement at ${formatVelocity()}/sec (${trendText})`;
  };
  
  return (
    <div className={`relative group ${className}`}>
      <div 
        className={`flex items-center px-2 py-1 rounded-md ${getColor()} overflow-hidden`}
        title={getTooltip()}
      >
        {/* Icon */}
        <div className="mr-1">
          {getIcon()}
        </div>
        
        {/* Velocity text */}
        <div className="font-mono text-xs">
          {isPositive && '+'}
          {formatVelocity()}
          <span className="text-xs opacity-70">/sec</span>
        </div>
        
        {/* Scrolling background effect */}
        {!isNeutral && (
          <div 
            className={`absolute inset-0 bg-gradient-to-r ${
              isPositive 
                ? 'from-green-500/0 via-green-500/10 to-green-500/0' 
                : 'from-red-500/0 via-red-500/10 to-red-500/0'
            } ${getAnimationSpeed()}`}
            style={{ 
              width: '200%',
              transform: 'translateX(-50%)'
            }}
          ></div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
        {getTooltip()}
      </div>
    </div>
  );
};

export default PriceVelocityTicker;
