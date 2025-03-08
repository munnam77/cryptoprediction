import React from 'react';

interface VolatilityWaveformProps {
  volatilityHistory: number[]; // Array of volatility values
  width?: number;
  height?: number;
  className?: string;
}

/**
 * VolatilityWaveform Component
 * Audio waveform-like visualization of price volatility
 */
const VolatilityWaveform: React.FC<VolatilityWaveformProps> = ({
  volatilityHistory,
  width = 100,
  height = 30,
  className = ''
}) => {
  // Find max volatility for normalization
  const maxVolatility = Math.max(...volatilityHistory, 0.001);
  
  // Calculate bar properties
  const barCount = volatilityHistory.length;
  const barWidth = width / barCount;
  const barSpacing = barWidth * 0.2;
  const actualBarWidth = barWidth - barSpacing;
  
  // Calculate average volatility
  const avgVolatility = volatilityHistory.reduce((sum, val) => sum + val, 0) / barCount;
  
  // Get color based on average volatility
  const getColor = () => {
    if (avgVolatility > 0.05) return 'from-purple-500 to-pink-500'; // High volatility
    if (avgVolatility > 0.02) return 'from-blue-500 to-purple-500'; // Medium volatility
    return 'from-cyan-500 to-blue-500'; // Low volatility
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const volatilityPercentage = (avgVolatility * 100).toFixed(2);
    let description = '';
    
    if (avgVolatility > 0.05) description = 'High volatility';
    else if (avgVolatility > 0.02) description = 'Medium volatility';
    else description = 'Low volatility';
    
    return `${description}: ${volatilityPercentage}% average price movement`;
  };
  
  return (
    <div 
      className={`relative ${className}`}
      title={getTooltip()}
    >
      <div 
        className="flex items-center justify-between"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {volatilityHistory.map((value, index) => {
          // Normalize height (minimum 10% height for visibility)
          const normalizedHeight = (value / maxVolatility) * 0.9 + 0.1;
          const barHeight = height * normalizedHeight;
          
          return (
            <div
              key={index}
              className={`bg-gradient-to-t ${getColor()} rounded-full`}
              style={{
                width: `${actualBarWidth}px`,
                height: `${barHeight}px`,
                marginLeft: index === 0 ? 0 : `${barSpacing}px`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VolatilityWaveform;
