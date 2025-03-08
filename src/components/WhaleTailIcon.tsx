import React from 'react';

interface WhaleTailIconProps {
  whaleActivity: 'buying' | 'selling' | 'neutral';
  transactionSize: number; // In USD
  className?: string;
}

/**
 * WhaleTailIcon Component
 * Icon showing large wallet transaction activity
 */
const WhaleTailIcon: React.FC<WhaleTailIconProps> = ({
  whaleActivity,
  transactionSize,
  className = ''
}) => {
  // Format transaction size
  const formatTransactionSize = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };
  
  // Get color based on whale activity
  const getColor = () => {
    switch (whaleActivity) {
      case 'buying':
        return 'text-green-500 dark:text-green-400';
      case 'selling':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  // Get size based on transaction size
  const getSize = () => {
    if (transactionSize >= 10_000_000) return 'w-6 h-6';
    if (transactionSize >= 1_000_000) return 'w-5 h-5';
    return 'w-4 h-4';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const activityText = whaleActivity.charAt(0).toUpperCase() + whaleActivity.slice(1);
    return `Whale ${activityText}: ${formatTransactionSize(transactionSize)}`;
  };
  
  return (
    <div 
      className={`inline-flex items-center ${className}`}
      title={getTooltip()}
    >
      {/* Whale tail SVG icon */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`${getSize()} ${getColor()}`}
      >
        <path d="M19 7C17.4 5.2 15.1 4 12.5 4C7.8 4 4 7.8 4 12.5C4 13.8 4.3 15 4.8 16.1C4.3 16.3 4 16.8 4 17.3V19C4 19.6 4.4 20 5 20H7C7.6 20 8 19.6 8 19V17.3C8 16.8 7.7 16.3 7.2 16.1C7.7 15 8 13.8 8 12.5C8 10 9.5 7.9 11.7 7.1C11.9 7 12.1 7 12.3 7.1C14.5 7.9 16 10 16 12.5C16 13.8 15.7 15 15.2 16.1C14.7 16.3 14.4 16.8 14.4 17.3V19C14.4 19.6 14.8 20 15.4 20H17.4C18 20 18.4 19.6 18.4 19V17.3C18.4 16.8 18.1 16.3 17.6 16.1C18.1 15 18.4 13.8 18.4 12.5" />
        <path d="M12 16L12 20" />
        <path d="M8 20L16 20" />
      </svg>
      
      {/* Transaction size */}
      <span className={`ml-1 text-xs font-medium ${getColor()}`}>
        {formatTransactionSize(transactionSize)}
      </span>
    </div>
  );
};

export default WhaleTailIcon;
