import React, { useState, useEffect } from 'react';

type MarketMoodOrbProps = {
  marketSentiment: number; // 0-100 sentiment score
  marketChange: number; // Market percentage change
  marketVolatility?: number; // Optional volatility score
  size?: number; // Size in pixels
  className?: string;
};

/**
 * Market Mood Orb (pulsing, green/red/yellow)
 * Visual indicator showing overall market sentiment
 */
const MarketMoodOrb: React.FC<MarketMoodOrbProps> = ({
  marketSentiment,
  marketChange,
  marketVolatility = 50,
  size = 40,
  className = '',
}) => {
  // Determine orb color based on market sentiment and change
  const getOrbColor = () => {
    // Extremely positive
    if (marketSentiment >= 80 && marketChange > 5) {
      return {
        innerColor: '#00ff99',
        outerColor: '#00cc7a',
        pulseColor: '#00ff9980', // Semi-transparent
        mood: 'Extremely Bullish'
      };
    }
    // Positive
    if (marketSentiment >= 60 || marketChange > 2) {
      return {
        innerColor: '#22c55e',
        outerColor: '#16a34a',
        pulseColor: '#22c55e80',
        mood: 'Bullish'
      };
    }
    // Neutral positive
    if (marketSentiment >= 50 || marketChange > 0) {
      return {
        innerColor: '#90ee90',
        outerColor: '#7dce7d',
        pulseColor: '#90ee9080',
        mood: 'Mildly Bullish'
      };
    }
    // Neutral
    if (marketSentiment >= 40 && marketSentiment < 60 && marketChange > -2 && marketChange < 2) {
      return {
        innerColor: '#facc15',
        outerColor: '#eab308',
        pulseColor: '#facc1580',
        mood: 'Neutral'
      };
    }
    // Neutral negative
    if (marketSentiment >= 30 || marketChange > -2) {
      return {
        innerColor: '#fbb04b',
        outerColor: '#f5921d',
        pulseColor: '#fbb04b80',
        mood: 'Cautious'
      };
    }
    // Negative
    if (marketSentiment >= 20 || marketChange > -5) {
      return {
        innerColor: '#ef4444',
        outerColor: '#dc2626',
        pulseColor: '#ef444480',
        mood: 'Bearish'
      };
    }
    // Extremely negative
    return {
      innerColor: '#dc2626',
      outerColor: '#b91c1c',
      pulseColor: '#dc262680',
      mood: 'Extremely Bearish'
    };
  };

  const { innerColor, outerColor, pulseColor, mood } = getOrbColor();
  
  // Calculate pulse speed based on volatility (higher = faster pulse)
  const pulseSpeed = `${Math.max(1, Math.min(5, 5 - (marketVolatility / 25)))}s`;
  
  // Calculate pulse intensity based on volatility (higher = more intense)
  const pulseIntensity = Math.min(1, Math.max(0.3, marketVolatility / 100));
  
  // Tooltip content
  const tooltipContent = `Market Mood: ${mood}\nSentiment: ${marketSentiment}/100\nChange: ${marketChange > 0 ? '+' : ''}${marketChange.toFixed(2)}%\nVolatility: ${marketVolatility}/100`;
  
  // Inner glow intensity based on sentiment (higher = more glow)
  const glowIntensity = Math.max(3, Math.min(10, marketSentiment / 10));
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={tooltipContent}
    >
      {/* Pulsing outer ring */}
      <div 
        className="absolute rounded-full animate-pulse"
        style={{ 
          width: size, 
          height: size,
          backgroundColor: pulseColor,
          animationDuration: pulseSpeed,
          opacity: pulseIntensity
        }}
      />
      
      {/* Main orb */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.75, 
          height: size * 0.75,
          background: `radial-gradient(circle, ${innerColor} 0%, ${outerColor} 90%)`,
          boxShadow: `0 0 ${glowIntensity}px ${innerColor}`,
        }}
      />
      
      {/* Inner core */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.4, 
          height: size * 0.4,
          background: `radial-gradient(circle, white 0%, ${innerColor} 70%)`,
          opacity: 0.7
        }}
      />
      
      {/* Market change indicator */}
      {Math.abs(marketChange) > 0.5 && (
        <div 
          className="absolute font-bold text-white text-opacity-90 text-center"
          style={{ 
            fontSize: `${Math.max(10, size / 4)}px`,
            textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
          }}
        >
          {marketChange > 0 ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
};

export default MarketMoodOrb;
