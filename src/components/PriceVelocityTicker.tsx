import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface PriceVelocityTickerProps {
  symbol: string;
  velocity: number; // Price change per second
  timeframe: string;
  className?: string;
  width?: number;
}

/**
 * PriceVelocityTicker Component
 * Scrolling bar showing price velocity (change per second)
 */
const PriceVelocityTicker: React.FC<PriceVelocityTickerProps> = ({
  symbol,
  velocity,
  timeframe,
  className = '',
  width = 120
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Format velocity based on magnitude
  const formatVelocity = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1) {
      return value.toFixed(2);
    } else if (absValue >= 0.01) {
      return value.toFixed(4);
    } else if (absValue >= 0.0001) {
      return value.toFixed(6);
    } else {
      return value.toFixed(8);
    }
  };
  
  // Get color based on velocity
  const getColor = () => {
    if (velocity > 0) return 'text-green-500 dark:text-green-400';
    if (velocity < 0) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const direction = velocity > 0 ? 'upward' : velocity < 0 ? 'downward' : 'neutral';
    return `${symbol} price velocity: ${formatVelocity(velocity)}/sec (${direction} trend over ${timeframe})`;
  };
  
  // Scroll animation
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    
    const scrollSpeed = Math.min(Math.abs(velocity) * 500, 50); // Faster for higher velocity, capped at 50px/s
    let startTime: number;
    let animationFrameId: number;
    
    const scroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Calculate scroll position (loop every 2 seconds)
      const position = (elapsed * scrollSpeed / 1000) % scrollElement.scrollWidth;
      scrollElement.scrollLeft = position;
      
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    animationFrameId = requestAnimationFrame(scroll);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [velocity]);
  
  // Generate ticker content
  const generateTickerContent = () => {
    const sign = velocity > 0 ? '+' : '';
    const content = `${sign}${formatVelocity(velocity)}/sec`;
    
    // Repeat content to create scrolling effect
    return Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className="flex items-center mx-3">
        <span>{content}</span>
        <ArrowRight className="w-3 h-3 mx-1" />
      </div>
    ));
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: `${width}px` }}
      title={getTooltip()}
    >
      <div 
        ref={scrollRef}
        className={`flex whitespace-nowrap overflow-x-hidden ${getColor()}`}
        style={{ width: `${width}px` }}
      >
        {generateTickerContent()}
      </div>
    </div>
  );
};

export default PriceVelocityTicker;
