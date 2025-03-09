import React from 'react';

type LiquidityDepthGaugeProps = {
  depth: number; // 0-100 value representing liquidity depth
  trend?: 'increasing' | 'decreasing' | 'stable';
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Liquidity Depth Gauge - Blue-green semi-circle
 * Visual representation of order book depth and trend
 */
const LiquidityDepthGauge: React.FC<LiquidityDepthGaugeProps> = ({
  depth,
  trend = 'stable',
  width = 80,
  height = 40,
  className = '',
}) => {
  // Normalize depth to 0-100 range
  const normalizedDepth = Math.min(Math.max(depth || 0, 0), 100);
  
  // Calculate fill percentage (0-180 degrees for semi-circle)
  const fillPercentage = (normalizedDepth / 100) * 180;
  
  // SVG parameters
  const centerX = width / 2;
  const centerY = height;
  const radius = Math.min(width / 2, height) - 2;
  
  // Calculate the end point of the arc
  const endX = centerX + radius * Math.sin((fillPercentage * Math.PI) / 180);
  const endY = centerY - radius * Math.cos((fillPercentage * Math.PI) / 180);
  
  // Arc path
  const arcPath = [
    `M ${centerX - radius} ${centerY}`, // Start at left point of semi-circle
    `A ${radius} ${radius} 0 ${fillPercentage > 90 ? 1 : 0} 1 ${endX} ${endY}` // Arc to end point
  ].join(' ');
  
  // Determine gradient colors based on trend
  const gradientColors = {
    increasing: ['#0ea5e9', '#10b981'], // blue to emerald
    stable: ['#0284c7', '#0ea5e9'],     // darker blue to lighter blue
    decreasing: ['#0c4a6e', '#0ea5e9']  // very dark blue to blue
  };
  
  // Ensure trend is a valid value
  const safeTrend = trend && ['increasing', 'decreasing', 'stable'].includes(trend) 
    ? trend 
    : 'stable';
  
  // Tooltip content
  const tooltipContent = `Order depth: ${normalizedDepth}% (${safeTrend})`;
  
  // Animation for the gauge fill
  const animationDuration = '1.2s';
  
  return (
    <div 
      className={`relative ${className}`} 
      title={tooltipContent}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background semi-circle */}
      <svg width={width} height={height} className="absolute top-0 left-0">
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="3"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors[safeTrend][0]} />
            <stop offset="100%" stopColor={gradientColors[safeTrend][1]} />
          </linearGradient>
        </defs>
        
        {/* Filled arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#depthGradient)"
          strokeWidth="3"
          style={{
            transition: `stroke-dasharray ${animationDuration} ease-in-out`,
            strokeDasharray: `${fillPercentage * radius * Math.PI / 180} ${radius * Math.PI}`,
          }}
          className="drop-shadow-md"
        />
        
        {/* Depth indicator dot */}
        <circle
          cx={endX}
          cy={endY}
          r="3"
          fill={normalizedDepth > 70 ? '#10b981' : normalizedDepth > 40 ? '#0ea5e9' : '#0c4a6e'}
          className={`${safeTrend === 'increasing' ? 'animate-pulse' : ''}`}
          style={{ filter: 'drop-shadow(0 0 2px currentColor)' }}
        />
        
        {/* Center value text */}
        <text
          x={centerX}
          y={centerY - radius / 3}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#e2e8f0"
          className="drop-shadow-sm"
        >
          {`${normalizedDepth}%`}
        </text>
      </svg>
      
      {/* Trend indicator */}
      {safeTrend !== 'stable' && (
        <div 
          className={`absolute bottom-1 right-1 text-xs font-bold ${
            safeTrend === 'increasing' ? 'text-emerald-400' : 'text-blue-300'
          }`}
        >
          {safeTrend === 'increasing' ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
};

export default LiquidityDepthGauge;
