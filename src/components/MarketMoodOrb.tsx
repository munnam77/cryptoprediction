import React from 'react';

interface MarketMoodOrbProps {
  marketSentiment: number; // 0-100
  marketChange: number;
  className?: string;
}

const MarketMoodOrb: React.FC<MarketMoodOrbProps> = ({
  marketSentiment,
  marketChange,
  className = ''
}) => {
  // Determine orb color based on sentiment
  const getOrbColors = () => {
    if (marketSentiment >= 75) {
      return {
        primary: '#22c55e',   // Strong bullish (green)
        glow: '#22c55e33'
      };
    } else if (marketSentiment >= 60) {
      return {
        primary: '#14b8a6',   // Moderately bullish (teal)
        glow: '#14b8a633'
      };
    } else if (marketSentiment >= 40) {
      return {
        primary: '#94a3b8',   // Neutral (slate)
        glow: '#94a3b833'
      };
    } else if (marketSentiment >= 25) {
      return {
        primary: '#f97316',   // Moderately bearish (orange)
        glow: '#f9731633'
      };
    } else {
      return {
        primary: '#ef4444',   // Strong bearish (red)
        glow: '#ef444433'
      };
    }
  };

  // Calculate pulse speed based on market change
  const getPulseSpeed = () => {
    const changeAbs = Math.abs(marketChange);
    if (changeAbs > 5) return '1s';
    if (changeAbs > 3) return '2s';
    if (changeAbs > 1) return '3s';
    return '4s';
  };

  const { primary, glow } = getOrbColors();
  const pulseSpeed = getPulseSpeed();

  return (
    <div className={`relative ${className}`}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* Main orb */}
      <div
        className="w-6 h-6 rounded-full transition-colors duration-500"
        style={{
          backgroundColor: primary,
          boxShadow: `0 0 10px ${glow}`,
          animation: `pulse ${pulseSpeed} ease-in-out infinite`
        }}
      />

      {/* Secondary pulse effect */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-500"
        style={{
          backgroundColor: primary,
          opacity: 0.3,
          animation: `pulse ${pulseSpeed} ease-in-out infinite 0.5s`
        }}
      />

      {/* Sentiment tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Market Sentiment: {marketSentiment}%
        <br />
        Change: {marketChange > 0 ? '+' : ''}{marketChange.toFixed(2)}%
      </div>
    </div>
  );
};

export default MarketMoodOrb;
