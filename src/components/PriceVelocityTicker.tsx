import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceVelocityTickerProps {
  velocity: number; // Price change per second, can be positive or negative
  trend?: 'accelerating' | 'decelerating' | 'stable';
  className?: string;
}

/**
 * PriceVelocityTicker Component
 * Shows the rate of price change per second with scrolling animation
 */
const PriceVelocityTicker: React.FC<PriceVelocityTickerProps> = ({
  velocity,
  trend = 'stable',
  className = ''
}) => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Format velocity value
  const formattedVelocity = Math.abs(velocity).toFixed(5);
  const sign = velocity >= 0 ? '+' : '-';
  
  // Get color based on velocity and trend
  const getColor = () => {
    if (velocity > 0) {
      return trend === 'accelerating' ? '#22c55e' : '#4ade80'; // Brighter green for accelerating
    }
    if (velocity < 0) {
      return trend === 'accelerating' ? '#ef4444' : '#f87171'; // Brighter red for accelerating
    }
    return '#6b7280'; // Gray for stable/zero
  };
  
  // Get trend icon
  const getTrendIcon = () => {
    if (velocity > 0) {
      return <TrendingUp className="w-3 h-3" />;
    }
    if (velocity < 0) {
      return <TrendingDown className="w-3 h-3" />;
    }
    return <Minus className="w-3 h-3" />;
  };
  
  // Get tooltip text based on trend and velocity
  const getTooltip = () => {
    let trendText = '';
    
    switch (trend) {
      case 'accelerating':
        trendText = velocity > 0 ? 'accelerating upwards' : 'accelerating downwards';
        break;
      case 'decelerating':
        trendText = velocity > 0 ? 'slowing upwards movement' : 'slowing downwards movement';
        break;
      case 'stable':
      default:
        trendText = velocity > 0 ? 'steady upwards' : velocity < 0 ? 'steady downwards' : 'stable';
    }
    
    return `Price changing at ${sign}$${formattedVelocity}/sec (${trendText})`;
  };
  
  // Animate ticker for scrolling effect
  useEffect(() => {
    if (!containerRef.current) return;
    
    const animationFrame = requestAnimationFrame(function animate() {
      setOffset(prev => {
        // Get container width
        const width = containerRef.current?.offsetWidth || 100;
        
        // Reset when offset exceeds width
        if (Math.abs(prev) >= width) {
          return 0;
        }
        
        // Move based on velocity direction
        const speed = Math.min(Math.abs(velocity) * 10, 2); // Clamp speed
        return prev - (velocity >= 0 ? speed : -speed);
      });
      
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [velocity]);
  
  // Get background gradient based on velocity and trend
  const getBackgroundGradient = () => {
    const baseColor = getColor();
    const baseColorTransparent = `${baseColor}00`;
    
    if (velocity > 0) {
      return `linear-gradient(to right, ${baseColorTransparent}, ${baseColor}, ${baseColorTransparent})`;
    }
    
    if (velocity < 0) {
      return `linear-gradient(to left, ${baseColorTransparent}, ${baseColor}, ${baseColorTransparent})`;
    }
    
    return '';
  };
  
  return (
    <div 
      className={`relative h-6 bg-gray-800 rounded-md overflow-hidden ${className}`}
      title={getTooltip()}
    >
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ background: getBackgroundGradient() }}
      />
      
      {/* Ticker content */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center text-xs font-medium"
        style={{ color: getColor() }}
      >
        <div 
          className="flex items-center space-x-1"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {getTrendIcon()}
          <span>{sign}${formattedVelocity}/s</span>
        </div>
      </div>
    </div>
  );
};

export default PriceVelocityTicker;
