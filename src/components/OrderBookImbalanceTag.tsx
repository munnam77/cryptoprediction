import React from 'react';

interface OrderBookImbalanceTagProps {
  buyPercentage: number;
  orderDepth?: number;
  className?: string;
}

/**
 * OrderBookImbalanceTag Component
 * Displays a rounded tag showing buy/sell order book imbalance
 */
const OrderBookImbalanceTag: React.FC<OrderBookImbalanceTagProps> = ({
  buyPercentage,
  orderDepth,
  className = ''
}) => {
  // Ensure buyPercentage is between 0 and 100
  const validBuyPercentage = Math.min(Math.max(buyPercentage, 0), 100);
  const sellPercentage = 100 - validBuyPercentage;
  
  // Determine tag color based on buy/sell ratio
  const getTagColor = () => {
    if (validBuyPercentage >= 70) return 'bg-green-500 text-white';
    if (validBuyPercentage >= 55) return 'bg-green-400 text-white';
    if (validBuyPercentage >= 45) return 'bg-gray-500 text-white';
    if (validBuyPercentage >= 30) return 'bg-red-400 text-white';
    return 'bg-red-500 text-white';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let tooltip = `Order book: ${validBuyPercentage.toFixed(0)}% buy, ${sellPercentage.toFixed(0)}% sell`;
    if (orderDepth !== undefined) {
      tooltip += `, depth: ${orderDepth.toLocaleString()} orders`;
    }
    return tooltip;
  };
  
  return (
    <div 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor()} ${className}`}
      title={getTooltip()}
    >
      {validBuyPercentage.toFixed(0)}% Buy
    </div>
  );
};

export default OrderBookImbalanceTag;
