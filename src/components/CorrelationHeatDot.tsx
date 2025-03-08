import React from 'react';

interface CorrelationHeatDotProps {
  correlation: number; // -1 to 1
  symbol: string;
  referenceSymbol: string;
  size?: number;
  className?: string;
}

/**
 * CorrelationHeatDot Component
 * Colored dot showing correlation with BTC or market
 */
const CorrelationHeatDot: React.FC<CorrelationHeatDotProps> = ({
  correlation,
  symbol,
  referenceSymbol,
  size = 12,
  className = ''
}) => {
  // Ensure correlation is between -1 and 1
  const validCorrelation = Math.min(Math.max(correlation, -1), 1);
  
  // Get color based on correlation value
  const getColor = () => {
    const absCorrelation = Math.abs(validCorrelation);
    
    if (validCorrelation > 0) {
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
  
  // Get border style based on correlation strength
  const getBorderStyle = () => {
    const absCorrelation = Math.abs(validCorrelation);
    
    if (absCorrelation >= 0.8) return 'border-2 border-white dark:border-gray-800';
    if (absCorrelation >= 0.5) return 'border border-white dark:border-gray-800';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let strength = '';
    const absCorrelation = Math.abs(validCorrelation);
    
    if (absCorrelation >= 0.7) strength = 'Strong';
    else if (absCorrelation >= 0.4) strength = 'Moderate';
    else if (absCorrelation >= 0.2) strength = 'Weak';
    else strength = 'No';
    
    const direction = validCorrelation > 0 ? 'positive' : validCorrelation < 0 ? 'negative' : 'no';
    
    return `${strength} ${direction} correlation (${validCorrelation.toFixed(2)}) between ${symbol} and ${referenceSymbol}`;
  };
  
  return (
    <div 
      className={`inline-block ${className}`}
      title={getTooltip()}
    >
      <div 
        className={`rounded-full ${getColor()} ${getBorderStyle()}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default CorrelationHeatDot;
