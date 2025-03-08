import React from 'react';

interface MicroRSIBarProps {
  value: number; // 0-100
  period?: number;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * MicroRSIBar Component
 * Tiny RSI indicator with color zones
 */
const MicroRSIBar: React.FC<MicroRSIBarProps> = ({
  value,
  period = 14,
  width = 60,
  height = 6,
  className = ''
}) => {
  // Ensure value is between 0-100
  const rsiValue = Math.min(Math.max(value, 0), 100);
  
  // Calculate position for the marker
  const markerPosition = (rsiValue / 100) * width;
  
  // Get tooltip text
  const getTooltip = () => {
    let condition = '';
    if (rsiValue >= 70) condition = 'Overbought';
    else if (rsiValue <= 30) condition = 'Oversold';
    else condition = 'Neutral';
    
    return `RSI-${period}: ${rsiValue.toFixed(1)} (${condition})`;
  };
  
  return (
    <div 
      className={`relative ${className}`}
      title={getTooltip()}
    >
      <div 
        className="rounded-full overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Background gradient */}
        <div 
          className="w-full h-full relative"
          style={{ 
            background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #eab308, #ef4444)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'left center'
          }}
        />
      </div>
      
      {/* Zone markers */}
      <div className="absolute top-0 h-full" style={{ left: '30%', width: '1px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
      <div className="absolute top-0 h-full" style={{ left: '70%', width: '1px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
      
      {/* Current value marker */}
      <div 
        className="absolute top-0 w-1 h-full bg-white border border-gray-800 dark:border-white rounded-full transform -translate-x-1/2"
        style={{ left: `${markerPosition}px` }}
      />
      
      {/* Value text */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
        {rsiValue.toFixed(1)}
      </div>
    </div>
  );
};

export default MicroRSIBar;
