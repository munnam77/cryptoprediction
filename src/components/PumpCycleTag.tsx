import React from 'react';

type PumpCycleTagProps = {
  cycles: number; // Number of pump cycles
  timeframe: string; // e.g., "7d" for 7 days
  pumpPercentage?: number; // Average pump percentage
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Pump Cycle Tag - Tag showing number of pump cycles
 * Displays how many times a coin has pumped within a timeframe
 */
const PumpCycleTag: React.FC<PumpCycleTagProps> = ({
  cycles,
  timeframe,
  pumpPercentage,
  width = 70,
  height = 24,
  className = '',
}) => {
  // Don't show if no pump cycles
  if (cycles <= 0) return null;
  
  // Calculate tag colors based on number of cycles
  const getTagColors = () => {
    if (cycles >= 5) return 'bg-pink-950 border-pink-600 text-pink-300'; // High number of cycles
    if (cycles >= 3) return 'bg-pink-900 border-pink-500 text-pink-200'; // Medium number of cycles
    return 'bg-pink-800 border-pink-400 text-pink-100'; // Low number of cycles
  };
  
  // Show pulse animation for high cycle counts
  const showPulse = cycles >= 4;
  
  // Format display text
  const displayText = `${cycles}x ${timeframe}`;
  
  // Tooltip content
  const tooltipContent = pumpPercentage 
    ? `${cycles} pumps >10% in ${timeframe} (avg. ${pumpPercentage.toFixed(1)}%)`
    : `${cycles} pumps >10% in ${timeframe}`;
  
  return (
    <div 
      className={`relative flex items-center justify-center 
        ${getTagColors()} border rounded-lg overflow-hidden
        ${showPulse ? 'animate-pulse' : ''} ${className}`}
      style={{ 
        width, 
        height,
        animationDuration: '3s'
      }}
      title={tooltipContent}
    >
      {/* Vertical bars representing each pump cycle */}
      <div className="absolute inset-0 flex items-end justify-evenly px-1">
        {[...Array(Math.min(cycles, 7))].map((_, index) => {
          // Calculate height for each bar (random but deterministic based on index)
          const barHeight = 30 + ((index * 7) % 40);
          const barOpacity = 0.4 + (index * 0.1);
          
          return (
            <div
              key={index}
              className="w-1 bg-pink-400"
              style={{ 
                height: `${barHeight}%`,
                opacity: barOpacity,
                borderTopLeftRadius: '1px',
                borderTopRightRadius: '1px'
              }}
            />
          );
        })}
      </div>
      
      {/* Tag text */}
      <div className="relative z-10 text-xs font-semibold px-2 bg-gradient-to-b from-transparent to-pink-900/70">
        {displayText}
      </div>
      
      {/* Pulse indicator for high cycle counts */}
      {cycles >= 5 && (
        <div 
          className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"
          style={{ animationDuration: '1s' }}
        />
      )}
      
      {/* Display average pump percentage if provided */}
      {pumpPercentage && (
        <div 
          className="absolute bottom-0 right-0 text-[8px] rounded-tl-sm px-1
            bg-pink-950/80 text-pink-300"
        >
          ~{pumpPercentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default PumpCycleTag;
