import React, { useState, useEffect } from 'react';
import type { MarketData } from '../types/binance';

interface CryptoBubbleProps {
  data: MarketData;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (data: MarketData) => void;
  isSelected?: boolean;
}

/**
 * CryptoBubble Component
 * 
 * A lively, animated bubble for displaying cryptocurrency data
 * Inspired by cryptobubbles.net with enhanced aesthetics and animations
 */
const CryptoBubble: React.FC<CryptoBubbleProps> = ({
  data,
  size = 'md',
  onClick,
  isSelected = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationDelay, setAnimationDelay] = useState('0s');
  
  // Set random animation delay on mount for staggered effect
  useEffect(() => {
    const delay = Math.random() * 2;
    setAnimationDelay(`${delay}s`);
  }, []);
  
  // Determine bubble size
  const getBubbleSize = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16';
      case 'lg': return 'w-28 h-28';
      default: return 'w-20 h-20';
    }
  };
  
  // Determine font size based on bubble size
  const getFontSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };
  
  // Determine price change color
  const getPriceChangeColor = () => {
    const change = data.priceChangePercent || 0;
    if (change > 5) return 'bg-green-500';
    if (change > 0) return 'bg-green-400';
    if (change < -5) return 'bg-red-500';
    if (change < 0) return 'bg-red-400';
    return 'bg-gray-400';
  };
  
  // Determine bubble background gradient based on price change
  const getBubbleGradient = () => {
    const change = data.priceChangePercent || 0;
    
    if (change > 10) return 'from-green-400 to-green-600';
    if (change > 5) return 'from-green-300 to-green-500';
    if (change > 0) return 'from-green-200 to-green-400';
    if (change < -10) return 'from-red-400 to-red-600';
    if (change < -5) return 'from-red-300 to-red-500';
    if (change < 0) return 'from-red-200 to-red-400';
    return 'from-gray-300 to-gray-500';
  };
  
  // Determine glow effect based on price change
  const getGlowEffect = () => {
    const change = data.priceChangePercent || 0;
    
    if (change > 5) return 'shadow-crypto-glow-success';
    if (change < -5) return 'shadow-crypto-glow-danger';
    if (Math.abs(change) > 0) return 'shadow-crypto-glow';
    return '';
  };
  
  // Format price change with + or - sign
  const formatPriceChange = () => {
    const change = data.priceChangePercent || 0;
    return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };
  
  // Determine animation based on price change
  const getAnimation = () => {
    const change = data.priceChangePercent || 0;
    
    if (Math.abs(change) > 10) return 'animate-bubble-float';
    if (Math.abs(change) > 5) return 'animate-float';
    return 'animate-float-slow';
  };
  
  return (
    <div
      className={`
        relative ${getBubbleSize()} rounded-full 
        bg-gradient-to-br ${getBubbleGradient()}
        ${getGlowEffect()}
        ${getAnimation()}
        flex items-center justify-center
        cursor-pointer
        transition-all duration-300 ease-in-out
        ${isSelected ? 'ring-4 ring-white ring-opacity-70' : ''}
        ${isHovered ? 'scale-110' : 'scale-100'}
      `}
      style={{ animationDelay }}
      onClick={() => onClick?.(data)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bubble content */}
      <div className="flex flex-col items-center justify-center text-white">
        <div className={`font-bold ${getFontSize()} uppercase`}>
          {data.baseAsset}
        </div>
        
        {/* Price change badge */}
        <div className={`
          ${getFontSize()} font-semibold mt-1
          px-1.5 py-0.5 rounded-full
          ${getPriceChangeColor()}
          transition-all duration-300
          ${isHovered ? 'opacity-100' : 'opacity-80'}
        `}>
          {formatPriceChange()}
        </div>
      </div>
      
      {/* Pulse effect for high volatility */}
      {(data.volatility || 0) > 70 && (
        <div className="absolute inset-0 rounded-full animate-pulse-slow bg-white opacity-20"></div>
      )}
      
      {/* Ripple effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 rounded-full animate-ripple bg-white opacity-20"></div>
      )}
    </div>
  );
};

export default CryptoBubble; 