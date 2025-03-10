import React from 'react';

interface SentimentPulseDotProps {
  sentiment: number; // -100 to 100 scale
}

/**
 * SentimentPulseDot Component
 * 
 * Displays a colored dot that pulses based on market sentiment
 * Negative values = bearish (red)
 * Positive values = bullish (green)
 * The intensity of the pulse and color depends on the sentiment strength
 */
const SentimentPulseDot: React.FC<SentimentPulseDotProps> = ({ sentiment }) => {
  // Normalize sentiment to ensure it's within -100 to 100 range
  const normalizedSentiment = Math.min(100, Math.max(-100, sentiment));
  
  // Determine color based on sentiment
  const getColor = () => {
    if (normalizedSentiment > 50) return 'bg-green-500';
    if (normalizedSentiment > 20) return 'bg-green-400';
    if (normalizedSentiment > 0) return 'bg-green-300';
    if (normalizedSentiment > -20) return 'bg-red-300';
    if (normalizedSentiment > -50) return 'bg-red-400';
    return 'bg-red-500';
  };
  
  // Determine pulse animation speed based on sentiment intensity
  const getPulseClass = () => {
    const intensity = Math.abs(normalizedSentiment);
    if (intensity > 70) return 'animate-pulse-fast';
    if (intensity > 40) return 'animate-pulse';
    if (intensity > 10) return 'animate-pulse-slow';
    return '';
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`w-3 h-3 rounded-full ${getColor()} ${getPulseClass()}`}
        title={`Market sentiment: ${normalizedSentiment > 0 ? 'Bullish' : 'Bearish'} (${normalizedSentiment})`}
      />
      <span className="text-xs font-medium">
        {normalizedSentiment > 0 ? '+' : ''}{normalizedSentiment}
      </span>
    </div>
  );
};

export default SentimentPulseDot;
