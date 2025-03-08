import React, { useState, useEffect } from 'react';

type BTCRippleLineProps = {
  btcChangePercent: number; // BTC percentage change over selected timeframe
  timeframe?: string; // e.g., "15m", "1h", "4h", "1d"
  height?: number;
  className?: string;
};

/**
 * BTC Ripple Line - Faint wave for BTC movements
 * Visualizes BTC price movements as a ripple effect
 */
const BTCRippleLine: React.FC<BTCRippleLineProps> = ({
  btcChangePercent,
  timeframe = "1h",
  height = 3,
  className = '',
}) => {
  // Only show ripple when BTC change is significant
  const shouldShowRipple = Math.abs(btcChangePercent) >= 1;
  
  if (!shouldShowRipple) {
    return (
      <div 
        className={`w-full ${className}`} 
        style={{ height }}
      />
    );
  }
  
  // Determine ripple characteristics based on change percentage
  const absChange = Math.abs(btcChangePercent);
  
  // More extreme changes = higher amplitude
  const amplitude = Math.min(12, Math.max(3, absChange));
  
  // More extreme changes = faster wave
  const waveSpeed = Math.max(5, Math.min(15, 10 + absChange));
  
  // Color based on direction (green for positive, red for negative)
  const baseColor = btcChangePercent >= 0 ? '#22c55e' : '#ef4444';
  
  // Generate wave points for SVG path
  const generateWavePath = () => {
    const waveSegments = 12;
    const points = [];
    
    // Start point
    points.push(`M 0 ${height / 2}`);
    
    // Create wave pattern
    for (let i = 0; i < waveSegments; i++) {
      // Calculate control points for cubic bezier curve
      const x1 = (i * 100) / waveSegments;
      const x2 = ((i + 1) * 100) / waveSegments;
      const cp1x = x1 + ((x2 - x1) / 3);
      const cp2x = x2 - ((x2 - x1) / 3);
      
      // Alternate y positions for wave effect
      const y1 = (i % 2 === 0) ? height / 2 - amplitude / 2 : height / 2 + amplitude / 2;
      const y2 = (i % 2 === 0) ? height / 2 + amplitude / 2 : height / 2 - amplitude / 2;
      
      // Add curve segment
      points.push(`C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${height / 2}`);
    }
    
    return points.join(' ');
  };
  
  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: Math.max(height, amplitude) }}
      title={`BTC: ${btcChangePercent > 0 ? '+' : ''}${btcChangePercent.toFixed(2)}% in ${timeframe}`}
    >
      <svg 
        width="100%" 
        height="100%" 
        preserveAspectRatio="none" 
        className="absolute w-full"
      >
        {/* First wave - main color */}
        <path
          d={generateWavePath()}
          fill="none"
          stroke={baseColor}
          strokeWidth="1.5"
          strokeOpacity="0.6"
          className="animate-pulse"
          style={{ animationDuration: `${waveSpeed}s` }}
        />
        
        {/* Second wave - offset for visual effect */}
        <path
          d={generateWavePath()}
          fill="none"
          stroke={baseColor}
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="5,5"
          className="animate-pulse"
          style={{ 
            animationDuration: `${waveSpeed * 1.5}s`,
            transform: 'translateX(25px)'
          }}
        />
        
        {/* Gradient overlay */}
        <defs>
          <linearGradient id="btcRippleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={baseColor} stopOpacity="0.1" />
            <stop offset="50%" stopColor={baseColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={baseColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Gradient overlay rectangle */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#btcRippleGradient)"
          opacity="0.5"
        />
      </svg>
      
      {/* BTC change percentage indicator */}
      {absChange >= 3 && (
        <div 
          className="absolute right-2 top-0 text-xs font-medium px-1 rounded"
          style={{ 
            backgroundColor: `${baseColor}25`, 
            color: baseColor,
            fontSize: '8px'
          }}
        >
          BTC {btcChangePercent > 0 ? '+' : ''}{btcChangePercent.toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default BTCRippleLine;
