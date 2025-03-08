import React from 'react';

interface SentimentPulseDotProps {
  sentiment: number; // -100 to 100
  source: string;
  size?: number;
  className?: string;
}

/**
 * SentimentPulseDot Component
 * Pulsing dot showing market sentiment from social media
 */
const SentimentPulseDot: React.FC<SentimentPulseDotProps> = ({
  sentiment,
  source,
  size = 12,
  className = ''
}) => {
  // Ensure sentiment is between -100 and 100
  const validSentiment = Math.min(Math.max(sentiment, -100), 100);
  
  // Get color based on sentiment
  const getColor = () => {
    if (validSentiment >= 70) return 'bg-green-500';
    if (validSentiment >= 30) return 'bg-green-400';
    if (validSentiment >= 0) return 'bg-green-300';
    if (validSentiment >= -30) return 'bg-red-300';
    if (validSentiment >= -70) return 'bg-red-400';
    return 'bg-red-500';
  };
  
  // Get pulse animation based on sentiment strength
  const getPulseAnimation = () => {
    const absValue = Math.abs(validSentiment);
    
    if (absValue >= 70) return 'animate-pulse';
    if (absValue >= 50) return 'animate-pulse';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let strength = '';
    const absValue = Math.abs(validSentiment);
    
    if (absValue >= 70) strength = 'Very';
    else if (absValue >= 30) strength = 'Moderately';
    else strength = 'Slightly';
    
    const direction = validSentiment >= 0 ? 'bullish' : 'bearish';
    
    return `${strength} ${direction} sentiment (${validSentiment.toFixed(0)}) from ${source}`;
  };
  
  return (
    <div 
      className={`inline-block ${className}`}
      title={getTooltip()}
    >
      <div 
        className={`rounded-full ${getColor()} ${getPulseAnimation()}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default SentimentPulseDot;
