import React from 'react';

interface BTCRippleLineProps {
  changePercent: number;
}

/**
 * BTCRippleLine Component
 * 
 * Displays a visual representation of Bitcoin's price change
 * with a ripple effect that indicates market movement
 */
const BTCRippleLine: React.FC<BTCRippleLineProps> = ({ changePercent }) => {
  // Determine color based on price change
  const getColor = () => {
    if (changePercent > 3) return 'bg-green-500';
    if (changePercent > 0) return 'bg-green-400';
    if (changePercent > -3) return 'bg-red-400';
    return 'bg-red-500';
  };
  
  // Determine ripple animation speed based on volatility
  const getRippleClass = () => {
    const absChange = Math.abs(changePercent);
    if (absChange > 5) return 'animate-ripple-fast';
    if (absChange > 2) return 'animate-ripple';
    if (absChange > 0.5) return 'animate-ripple-slow';
    return '';
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="text-xs font-medium">BTC</div>
      <div className="relative h-1 bg-gray-700 rounded-full w-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${getColor()} rounded-full`}
          style={{ width: '100%', opacity: 0.5 }}
        />
        <div 
          className={`absolute top-0 left-0 h-full w-2 ${getColor()} rounded-full ${getRippleClass()}`}
        />
      </div>
      <div className={`text-xs font-medium ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
      </div>
    </div>
  );
};

export default BTCRippleLine;
