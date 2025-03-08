import React from 'react';

interface HeatmapIndicatorProps {
  value: number; // Value between -100 and 100
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  tooltipContent?: string;
  className?: string;
}

function HeatmapIndicator({
  value,
  size = 'md',
  showTooltip = false,
  tooltipContent,
  className = ''
}: HeatmapIndicatorProps) {
  // Normalize value to ensure it's within -100 to 100 range
  const normalizedValue = Math.max(-100, Math.min(100, value));
  
  // Determine color based on the value
  const getColor = () => {
    // Negative values (red scale)
    if (normalizedValue < -75) return 'bg-red-700';
    if (normalizedValue < -50) return 'bg-red-600';
    if (normalizedValue < -25) return 'bg-red-500';
    if (normalizedValue < -10) return 'bg-red-400';
    if (normalizedValue < 0) return 'bg-red-300';
    
    // Positive values (green scale)
    if (normalizedValue > 75) return 'bg-green-700';
    if (normalizedValue > 50) return 'bg-green-600';
    if (normalizedValue > 25) return 'bg-green-500';
    if (normalizedValue > 10) return 'bg-green-400';
    if (normalizedValue > 0) return 'bg-green-300';
    
    // Neutral (exactly 0)
    return 'bg-gray-500';
  };
  
  // Determine size in pixels
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };
  
  // Determine intensity (opacity) based on absolute value
  const getIntensity = () => {
    const absValue = Math.abs(normalizedValue);
    if (absValue >= 70) return '1';
    if (absValue >= 40) return '0.9';
    if (absValue >= 20) return '0.8';
    if (absValue >= 10) return '0.7';
    return '0.6';
  };
  
  return (
    <div className={`relative ${className}`}>
      <div
        className={`${getSize()} ${getColor()} rounded-sm`}
        style={{ opacity: getIntensity() }}
        data-tip={showTooltip ? tooltipContent || `Value: ${normalizedValue}` : undefined}
      />
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
          {tooltipContent || `Value: ${normalizedValue}`}
        </div>
      )}
    </div>
  );
}

export default HeatmapIndicator;