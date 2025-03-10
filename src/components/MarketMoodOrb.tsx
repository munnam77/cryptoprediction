import React from 'react';

interface MarketMoodOrbProps {
  sentiment: number; // 0-100 scale
  volatility: number; // 0-100 scale
}

/**
 * MarketMoodOrb Component
 * 
 * Displays a glowing orb that represents market sentiment and volatility
 * - Color indicates sentiment (green = bullish, red = bearish)
 * - Pulse speed indicates volatility
 */
const MarketMoodOrb: React.FC<MarketMoodOrbProps> = ({ sentiment, volatility }) => {
  // Ensure values are within 0-100 range
  const normalizedSentiment = Math.min(100, Math.max(0, sentiment));
  const normalizedVolatility = Math.min(100, Math.max(0, volatility));
  
  // Determine color based on sentiment
  const getColor = () => {
    if (normalizedSentiment > 75) return 'bg-green-500';
    if (normalizedSentiment > 60) return 'bg-green-400';
    if (normalizedSentiment > 50) return 'bg-blue-400';
    if (normalizedSentiment > 40) return 'bg-yellow-400';
    if (normalizedSentiment > 25) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  // Determine glow color based on sentiment
  const getGlowColor = () => {
    if (normalizedSentiment > 75) return 'shadow-green-500/50';
    if (normalizedSentiment > 60) return 'shadow-green-400/50';
    if (normalizedSentiment > 50) return 'shadow-blue-400/50';
    if (normalizedSentiment > 40) return 'shadow-yellow-400/50';
    if (normalizedSentiment > 25) return 'shadow-orange-400/50';
    return 'shadow-red-500/50';
  };
  
  // Determine pulse animation based on volatility
  const getPulseClass = () => {
    if (normalizedVolatility > 75) return 'animate-pulse-fast';
    if (normalizedVolatility > 50) return 'animate-pulse';
    if (normalizedVolatility > 25) return 'animate-pulse-slow';
    return '';
  };
  
  // Get sentiment label
  const getSentimentLabel = () => {
    if (normalizedSentiment > 75) return 'Bullish';
    if (normalizedSentiment > 60) return 'Positive';
    if (normalizedSentiment > 50) return 'Slightly Positive';
    if (normalizedSentiment > 40) return 'Neutral';
    if (normalizedSentiment > 25) return 'Slightly Bearish';
    return 'Bearish';
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div 
        className={`w-4 h-4 rounded-full ${getColor()} ${getPulseClass()} shadow-lg ${getGlowColor()}`}
        title={`Market Sentiment: ${getSentimentLabel()} (${normalizedSentiment}%), Volatility: ${normalizedVolatility}%`}
      />
      <span className="text-sm font-medium">{getSentimentLabel()}</span>
    </div>
  );
};

export default MarketMoodOrb;
