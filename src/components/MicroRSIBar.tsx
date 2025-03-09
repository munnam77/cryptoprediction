import React from 'react';

interface MicroRSIBarProps {
  value: number; // 0-100
  period?: number; // RSI period (default 14)
  width?: number;
  height?: number;
  className?: string;
}

/**
 * MicroRSIBar Component
 * Small visual indicator showing RSI value with color coding for overbought/oversold conditions
 */
const MicroRSIBar: React.FC<MicroRSIBarProps> = ({
  value,
  period = 14,
  width = 100,
  height = 6,
  className = ''
}) => {
  // Ensure value is within 0-100 range
  const safeValue = Math.min(Math.max(value, 0), 100);
  
  // Determine marker position
  const markerPosition = `${safeValue}%`;
  
  // Get color based on RSI value
  const getMarkerColor = () => {
    if (safeValue >= 70) return '#ef4444'; // Red (overbought)
    if (safeValue <= 30) return '#3b82f6'; // Blue (oversold)
    return '#22c55e'; // Green (neutral)
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let status = 'Neutral';
    if (safeValue >= 70) status = 'Overbought';
    if (safeValue <= 30) status = 'Oversold';
    
    return `RSI-${period}: ${safeValue.toFixed(1)} (${status})`;
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
            background: 'linear-gradient(to right, #3b82f6, #22c55e, #ef4444)',
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
        className="absolute top-0 transform -translate-x-1/2"
        style={{ 
          left: markerPosition, 
          height: `${height + 4}px`,
          width: '3px',
          backgroundColor: getMarkerColor(),
          borderRadius: '1px'
        }}
      />
    </div>
  );
};

export default MicroRSIBar;
