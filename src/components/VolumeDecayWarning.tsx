import React from 'react';

type VolumeDecayWarningProps = {
  decayPercentage: number; // Negative percentage indicating volume decay
  timeframe: string; // e.g., "15m", "1h", "4h", "1d"
  size?: number;
  className?: string;
};

/**
 * Volume Decay Warning - Fading gray triangle
 * Visual indicator showing declining volume over time
 */
const VolumeDecayWarning: React.FC<VolumeDecayWarningProps> = ({
  decayPercentage,
  timeframe,
  size = 40,
  className = '',
}) => {
  // Only show for significant volume decay (negative percentage)
  if (decayPercentage >= -5) return null;
  
  // Normalize decay to positive number for calculations
  const absDecay = Math.abs(decayPercentage);
  
  // Calculate opacity based on decay percentage (more decay = more visible)
  const opacity = Math.min(0.9, Math.max(0.2, absDecay / 100));
  
  // Calculate triangle size based on decay percentage
  const triangleSize = Math.min(size, Math.max(size * 0.6, size * (absDecay / 100)));
  
  // Tooltip content
  const tooltipContent = `Volume down ${absDecay.toFixed(1)}% in ${timeframe}`;
  
  // Determine if the warning should pulse based on severity
  const shouldPulse = absDecay > 50;
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      title={tooltipContent}
    >
      {/* Gray triangle warning */}
      <div 
        className={`
          absolute 
          left-1/2 top-1/2 
          transform -translate-x-1/2 -translate-y-1/2
          ${shouldPulse ? 'animate-pulse' : ''}
        `}
        style={{ 
          width: triangleSize, 
          height: triangleSize,
          animationDuration: '3s'
        }}
      >
        <svg 
          width={triangleSize} 
          height={triangleSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="decayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#71717a" stopOpacity={opacity} />
              <stop offset="100%" stopColor="#71717a" stopOpacity={opacity * 0.5} />
            </linearGradient>
          </defs>
          
          {/* Triangle shape */}
          <path 
            d="M12 2L2 22h20L12 2z" 
            fill="url(#decayGradient)" 
            stroke="#52525b" 
            strokeWidth="1"
            className="drop-shadow-sm"
          />
          
          {/* Decay percentage text */}
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize={triangleSize / 6}
            fontWeight="bold"
            fill="#f8fafc"
          >
            {`${decayPercentage.toFixed(0)}%`}
          </text>
        </svg>
      </div>
      
      {/* Volume lines with fade effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gray-500"
            style={{
              left: `${5 + i * 20}%`,
              top: `${50 + i * 8}%`,
              width: '2px',
              height: `${20 - i * 4}%`,
              opacity: opacity * (1 - i * 0.15),
              borderRadius: '1px'
            }}
          />
        ))}
      </div>
      
      {/* Timeframe indicator */}
      {absDecay > 25 && (
        <div 
          className="absolute bottom-1 right-1 text-[8px] font-medium text-gray-400 bg-gray-800 
            px-1 rounded"
        >
          {timeframe}
        </div>
      )}
    </div>
  );
};

export default VolumeDecayWarning;
