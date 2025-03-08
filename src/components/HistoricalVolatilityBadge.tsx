import React from 'react';

type HistoricalVolatilityBadgeProps = {
  percentile: number; // 0-100, represents the coin's volatility percentile vs peers
  timeframe: string; // e.g., "7d", "30d"
  className?: string;
};

/**
 * Historical Volatility Badge - Silver badge showing volatility rank
 * Displays how the coin's volatility ranks compared to its peers
 */
const HistoricalVolatilityBadge: React.FC<HistoricalVolatilityBadgeProps> = ({
  percentile,
  timeframe,
  className = '',
}) => {
  // Determine badge description based on percentile
  const getBadgeDesc = () => {
    if (percentile <= 5) return 'Top 5%';
    if (percentile <= 10) return 'Top 10%';
    if (percentile <= 25) return 'Top 25%';
    if (percentile <= 50) return 'Top 50%';
    return 'Bottom 50%';
  };

  // Determine badge color based on percentile
  const getBadgeColor = () => {
    if (percentile <= 5) return 'from-gray-100 to-gray-300 border-gray-400'; // Silver for top 5%
    if (percentile <= 10) return 'from-gray-200 to-gray-400 border-gray-500'; // Dark silver for top 10%
    if (percentile <= 25) return 'from-gray-300 to-gray-500 border-gray-600'; // Even darker for top 25%
    return 'from-gray-500 to-gray-700 border-gray-800'; // Dark gray for rest
  };

  // Badge text and tooltip
  const badgeText = `${getBadgeDesc()} ${timeframe}`;
  const tooltipText = `This coin's volatility ranks in the top ${percentile}% over the last ${timeframe}`;

  return (
    <div
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium 
        bg-gradient-to-r ${getBadgeColor()} text-gray-900 border 
        shadow-inner ${percentile <= 10 ? 'animate-pulse shadow-md' : ''}
        ${className}`}
      title={tooltipText}
      style={{ 
        animationDuration: '3s',
        textShadow: percentile <= 5 ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
      }}
    >
      {/* Add a small icon for the most volatile coins */}
      {percentile <= 5 && (
        <svg 
          className="w-3 h-3 mr-1 text-gray-800" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 3L14.5 8.5H19.5L15 12L17 18L12 14.5L7 18L9 12L4.5 8.5H9.5L12 3Z" 
            fill="currentColor" 
            stroke="currentColor" 
            strokeWidth="1"
          />
        </svg>
      )}
      {badgeText}
    </div>
  );
};

export default HistoricalVolatilityBadge;
