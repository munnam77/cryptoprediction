import React from 'react';

interface CorrelationHeatDotProps {
  value: number;        // -100 to 100
  baseAsset: string;   // The base asset being compared (e.g., "ETH", "BTC")
  className?: string;
}

/**
 * CorrelationHeatDot Component
 * Colored dot showing correlation with BTC
 */
const CorrelationHeatDot: React.FC<CorrelationHeatDotProps> = ({
  value,
  baseAsset,
  className = ''
}) => {
  // Ensure value is between -100 and 100
  const validValue = Math.min(Math.max(value, -100), 100);
  const normalizedCorrelation = validValue / 100; // Convert to -1 to 1 scale
  
  // Get color based on correlation value
  const getColor = () => {
    const absCorrelation = Math.abs(normalizedCorrelation);
    
    if (normalizedCorrelation > 0) {
      // Positive correlation (green)
      if (absCorrelation >= 0.7) return 'bg-green-500';
      if (absCorrelation >= 0.4) return 'bg-green-400';
      if (absCorrelation >= 0.2) return 'bg-green-300';
      return 'bg-gray-300 dark:bg-gray-600';
    } else {
      // Negative correlation (red)
      if (absCorrelation >= 0.7) return 'bg-red-500';
      if (absCorrelation >= 0.4) return 'bg-red-400';
      if (absCorrelation >= 0.2) return 'bg-red-300';
      return 'bg-gray-300 dark:bg-gray-600';
    }
  };
  
  // Get intensity class based on correlation strength
  const getIntensityClass = () => {
    const absCorrelation = Math.abs(normalizedCorrelation);
    if (absCorrelation >= 0.8) return 'ring-2 ring-white dark:ring-gray-800 shadow-lg';
    if (absCorrelation >= 0.5) return 'ring-1 ring-white dark:ring-gray-800 shadow';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let strength = '';
    const absCorrelation = Math.abs(normalizedCorrelation);
    
    if (absCorrelation >= 0.7) strength = 'Strong';
    else if (absCorrelation >= 0.4) strength = 'Moderate';
    else if (absCorrelation >= 0.2) strength = 'Weak';
    else strength = 'No';
    
    const direction = normalizedCorrelation > 0 ? 'positive' : normalizedCorrelation < 0 ? 'negative' : 'no';
    
    return `${strength} ${direction} correlation (${validValue.toFixed(0)}%) between ${baseAsset} and BTC`;
  };
  
  // Render a row of dots to show correlation intensity
  const renderDots = () => {
    const numDots = 5;
    const dots = [];
    const absCorrelation = Math.abs(normalizedCorrelation);
    const activeDots = Math.ceil(absCorrelation * numDots);
    
    for (let i = 0; i < numDots; i++) {
      dots.push(
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
            i < activeDots ? getColor() : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
      );
    }
    
    return dots;
  };
  
  return (
    <div 
      className={`flex items-center space-x-1 ${className}`}
      title={getTooltip()}
    >
      {/* Large correlation dot */}
      <div 
        className={`w-3 h-3 rounded-full ${getColor()} ${getIntensityClass()}`}
      />
      
      {/* Correlation intensity bar */}
      <div className="flex space-x-0.5">
        {renderDots()}
      </div>
    </div>
  );
};

export default CorrelationHeatDot;
