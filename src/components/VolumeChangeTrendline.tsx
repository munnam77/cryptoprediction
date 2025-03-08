import React from 'react';

type VolumeChangeTrendlineProps = {
  volumeHistory: number[];
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Volume Change % Trendline - White dotted slope on gradient bar
 * Shows volume trend over time
 */
const VolumeChangeTrendline: React.FC<VolumeChangeTrendlineProps> = ({
  volumeHistory,
  width = 80,
  height = 20,
  className = '',
}) => {
  // Calculate trend direction and angle based on volume history
  const getTrendData = () => {
    if (!volumeHistory || volumeHistory.length < 2) {
      return { direction: 'neutral', angle: 0, trend: 0 };
    }

    // Calculate percentage change between first and last points
    const first = volumeHistory[0];
    const last = volumeHistory[volumeHistory.length - 1];
    const trend = first === 0 ? 0 : ((last - first) / first) * 100;
    
    // Determine direction
    const direction = trend > 3 ? 'up' : trend < -3 ? 'down' : 'neutral';
    
    // Calculate angle for the line (max 45 degrees)
    const angle = Math.min(Math.max(trend * 0.5, -45), 45);
    
    return { direction, angle, trend };
  };

  const { direction, angle, trend } = getTrendData();
  
  const gradientColors = {
    up: 'from-emerald-900 to-emerald-500',
    neutral: 'from-gray-700 to-gray-500',
    down: 'from-red-900 to-red-500'
  };

  // Create points for the dotted line
  const createLinePoints = () => {
    const points = [];
    const numDots = 8;
    
    // Starting point is in the middle or adjusted based on trend
    const startX = 5;
    const endX = width - 5;
    const midY = height / 2;
    
    // Calculate y position based on angle
    const endY = midY - (Math.tan((angle * Math.PI) / 180) * (endX - startX));
    
    for (let i = 0; i < numDots; i++) {
      const x = startX + (i * (endX - startX)) / (numDots - 1);
      const y = midY + ((endY - midY) * i) / (numDots - 1);
      points.push({ x, y });
    }
    
    return points;
  };

  const dots = createLinePoints();

  // Tooltip content
  const tooltipContent = `Volume trend: ${trend.toFixed(2)}%/h`;

  return (
    <div className={`relative ${className}`} title={tooltipContent}>
      {/* Gradient bar background */}
      <div 
        className={`w-full h-full rounded-md bg-gradient-to-r ${gradientColors[direction as keyof typeof gradientColors]}`}
      >
        {/* SVG for dotted line */}
        <svg width={width} height={height} className="absolute top-0 left-0">
          {dots.map((dot, index) => (
            <circle
              key={index}
              cx={dot.x}
              cy={dot.y}
              r={1.5}
              fill="white"
              className="animate-pulse"
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: 0.8
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default VolumeChangeTrendline;
