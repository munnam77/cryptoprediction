import React from 'react';

interface OrderBookImbalanceTagProps {
  value: number; // -100 to 100 scale, negative = sell pressure, positive = buy pressure
}

/**
 * OrderBookImbalanceTag Component
 * 
 * Displays a tag indicating the imbalance between buy and sell orders
 * Positive values = more buy orders (bullish)
 * Negative values = more sell orders (bearish)
 * The color and intensity depends on the imbalance strength
 */
const OrderBookImbalanceTag: React.FC<OrderBookImbalanceTagProps> = ({ value }) => {
  // Normalize value to ensure it's within -100 to 100 range
  const normalizedValue = Math.min(100, Math.max(-100, value));
  const absValue = Math.abs(normalizedValue);
  
  // Determine background color based on imbalance
  const getBackgroundColor = () => {
    if (normalizedValue > 50) return 'bg-green-500/20 text-green-500 border-green-500/30';
    if (normalizedValue > 20) return 'bg-green-400/15 text-green-400 border-green-400/30';
    if (normalizedValue > 0) return 'bg-green-300/10 text-green-300 border-green-300/20';
    if (normalizedValue > -20) return 'bg-red-300/10 text-red-300 border-red-300/20';
    if (normalizedValue > -50) return 'bg-red-400/15 text-red-400 border-red-400/30';
    return 'bg-red-500/20 text-red-500 border-red-500/30';
  };
  
  // Get label text based on imbalance
  const getLabel = () => {
    if (absValue < 10) return 'Neutral';
    if (normalizedValue > 0) return 'Buy Pressure';
    return 'Sell Pressure';
  };
  
  return (
    <div 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBackgroundColor()}`}
      title={`Order book imbalance: ${normalizedValue}`}
    >
      {getLabel()} {absValue > 10 ? `${absValue}%` : ''}
    </div>
  );
};

export default OrderBookImbalanceTag;
