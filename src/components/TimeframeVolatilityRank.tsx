import React from 'react';

type TimeframeVolatilityRankProps = {
  rank: number; // Numeric rank (1 = highest volatility, etc.)
  total?: number; // Total number of coins compared against
  timeframe: string; // e.g., "15m", "1h", "4h", "1d"
  size?: number;
  className?: string;
};

/**
 * Timeframe Volatility Rank - Number badge showing volatility ranking
 * Displays numeric rank based on volatility within a specific timeframe
 */
const TimeframeVolatilityRank: React.FC<TimeframeVolatilityRankProps> = ({
  rank,
  total = 100,
  timeframe,
  size = 26,
  className = '',
}) => {
  // Only show ranks for top performers
  if (rank > 20) return null;
  
  // Determine badge color based on rank
  const getBadgeColor = () => {
    if (rank === 1) return 'from-purple-600 to-purple-800 border-purple-500 text-white'; // #1 rank
    if (rank <= 3) return 'from-purple-500 to-purple-700 border-purple-400 text-white'; // Top 3
    if (rank <= 5) return 'from-purple-400 to-purple-600 border-purple-300 text-white'; // Top 5
    if (rank <= 10) return 'from-purple-300 to-purple-500 border-purple-200 text-white'; // Top 10
    return 'from-purple-200 to-purple-400 border-purple-100 text-gray-800'; // Top 20
  };
  
  // Determine the badge glow effect based on rank
  const getGlowEffect = () => {
    if (rank === 1) return 'drop-shadow-glow-md text-purple-300';
    if (rank <= 3) return 'drop-shadow-glow-sm text-purple-200';
    return '';
  };
  
  // Tooltip content
  const tooltipContent = `Ranked #${rank} in volatility out of ${total} coins for ${timeframe} timeframe`;
  
  // Determine if this should have animation
  const hasAnimation = rank <= 3;
  
  return (
    <div
      className={`relative flex items-center justify-center rounded-full
        bg-gradient-to-br ${getBadgeColor()} border
        ${hasAnimation ? 'animate-pulse' : ''} ${className}`}
      style={{ 
        width: size, 
        height: size,
        animationDuration: '3s'
      }}
      title={tooltipContent}
    >
      {/* Rank number */}
      <div 
        className={`text-xs font-bold ${getGlowEffect()}`}
        style={{ lineHeight: 1 }}
      >
        {rank}
      </div>
      
      {/* Tiny timeframe indicator at bottom */}
      <div 
        className="absolute -bottom-1 bg-purple-900 text-purple-100 text-[6px] px-1 
          rounded-sm border border-purple-300 font-medium"
        style={{ lineHeight: 1.2 }}
      >
        {timeframe}
      </div>
      
      {/* Decorative elements for top 3 */}
      {rank <= 3 && (
        <div 
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-300"
          style={{ 
            boxShadow: '0 0 2px 1px rgba(168, 85, 247, 0.5)'
          }}
        />
      )}
    </div>
  );
};

export default TimeframeVolatilityRank;
