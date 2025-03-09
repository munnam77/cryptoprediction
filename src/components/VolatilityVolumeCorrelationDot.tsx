import React from 'react';

type VolatilityVolumeCorrelationDotProps = {
  volatility: number; // 0-100 scale
  volumeChange: number; // percentage change
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Volatility vs. Volume Correlation Dot - Purple dot on mini-plane
 * Shows relationship between volatility and volume change
 */
const VolatilityVolumeCorrelationDot: React.FC<VolatilityVolumeCorrelationDotProps> = ({
  volatility,
  volumeChange,
  width = 80,
  height = 50,
  className = '',
}) => {
  // Normalize values to coordinate system
  const normalizedVolatility = Math.min(Math.max(volatility || 0, 0), 100) / 100;
  
  // Volume change percentage is unbounded, so we normalize it between -1 and 1
  // where anything beyond +/-100% is capped
  const normalizedVolumeChange = Math.min(Math.max((volumeChange || 0) / 100, -1), 1);
  
  // Safely format number with fallback
  const formatNumber = (num: number | undefined): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toFixed(2);
  };

  // Calculate position
  const xPos = 5 + normalizedVolatility * (width - 10); // x-axis is volatility
  const yPos = height - 5 - ((normalizedVolumeChange + 1) / 2) * (height - 10); // y-axis is volume change
  
  // Ensure xPos and yPos are valid numbers
  const safeXPos = isNaN(xPos) ? width / 2 : xPos;
  const safeYPos = isNaN(yPos) ? height / 2 : yPos;
  
  // Calculate correlation value (-1 to 1)
  // High positive correlation: high volatility with high volume (top right)
  // High negative correlation: high volatility with low volume (bottom right)
  const correlation = normalizedVolatility * normalizedVolumeChange;
  
  // Determine dot color based on position in the plane
  const getDotColor = () => {
    if (normalizedVolatility > 0.7 && normalizedVolumeChange > 0.5) {
      return '#a855f7'; // bright purple for high volatility & high volume
    } else if (normalizedVolatility > 0.7 && normalizedVolumeChange < 0) {
      return '#7e22ce'; // darker purple for high volatility & low volume
    } else if (normalizedVolatility < 0.3 && normalizedVolumeChange > 0.5) {
      return '#c084fc'; // light purple for low volatility & high volume
    } else {
      return '#9333ea'; // default purple
    }
  };
  
  // Determine dot size based on volatility
  const dotSize = 3 + normalizedVolatility * 5;
  
  // Tooltip content
  const tooltipContent = `Volatility: ${formatNumber(volatility)}%, Volume Change: ${formatNumber(volumeChange)}%
${correlation > 0.6 ? 'High correlation' : correlation < -0.6 ? 'Negative correlation' : 'Moderate correlation'}`;
  
  return (
    <div 
      className={`relative ${className}`} 
      title={tooltipContent}
      style={{ width, height }}
    >
      {/* Background grid with gradient */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-70 rounded-md overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-transparent"
        >
          {/* Grid lines */}
          <svg width={width} height={height} className="absolute top-0 left-0">
            {/* Vertical grid lines */}
            {[0.25, 0.5, 0.75].map((pos, idx) => (
              <line 
                key={`v-${idx}`}
                x1={width * pos} 
                y1={0} 
                x2={width * pos} 
                y2={height}
                stroke="#3f3f46"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((pos, idx) => (
              <line 
                key={`h-${idx}`}
                x1={0} 
                y1={height * pos} 
                x2={width} 
                y2={height * pos}
                stroke="#3f3f46"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Correlation dot */}
            <circle
              cx={safeXPos}
              cy={safeYPos}
              r={dotSize}
              fill={getDotColor()}
              className={`drop-shadow-glow-sm ${
                normalizedVolatility > 0.7 && normalizedVolumeChange > 0.5 ? 'animate-pulse' : ''
              }`}
              style={{ 
                filter: `drop-shadow(0 0 3px ${getDotColor()})`,
                animationDuration: '2s'
              }}
            />
            
            {/* X-axis label (volatility) */}
            <text
              x={width - 8}
              y={height - 2}
              textAnchor="end"
              fontSize="7"
              fill="#a1a1aa"
            >
              Vol
            </text>
            
            {/* Y-axis label (volume) */}
            <text
              x={3}
              y={8}
              textAnchor="start"
              fontSize="7"
              fill="#a1a1aa"
            >
              Vol Δ
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default VolatilityVolumeCorrelationDot;
