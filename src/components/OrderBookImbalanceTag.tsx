import React from 'react';

interface OrderBookImbalanceTagProps {
  imbalance: number;  // 0-100 value where higher means more buy pressure
  volume: number;     // Trading volume for context
  className?: string;
}

/**
 * OrderBookImbalanceTag Component
 * Displays a rounded tag showing buy/sell order book imbalance
 */
const OrderBookImbalanceTag: React.FC<OrderBookImbalanceTagProps> = ({
  imbalance,
  volume,
  className = ''
}) => {
  // Ensure imbalance is between 0 and 100
  const validImbalance = Math.min(Math.max(imbalance, 0), 100);
  const buyPercentage = validImbalance;
  const sellPercentage = 100 - validImbalance;
  
  // Determine tag color based on buy/sell ratio
  const getTagColor = () => {
    if (buyPercentage >= 70) return 'bg-green-500 text-white';
    if (buyPercentage >= 55) return 'bg-green-400 text-white';
    if (buyPercentage >= 45) return 'bg-gray-500 text-white';
    if (buyPercentage >= 30) return 'bg-red-400 text-white';
    return 'bg-red-500 text-white';
  };

  // Format volume for display
  const formatVolume = (vol: number): string => {
    if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
    return vol.toFixed(0);
  };
  
  // Get tooltip text
  const getTooltip = () => {
    return `Order book pressure: ${buyPercentage.toFixed(0)}% buy, ${sellPercentage.toFixed(0)}% sell
Volume: $${formatVolume(volume)}`;
  };
  
  return (
    <div 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor()} ${className}`}
      title={getTooltip()}
    >
      <span className="relative">
        {buyPercentage.toFixed(0)}%
        {buyPercentage >= 65 && (
          <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        )}
      </span>
    </div>
  );
};

export default OrderBookImbalanceTag;
