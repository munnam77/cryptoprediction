import React from 'react';

interface VolatilityWaveformProps {
  data: number[]; // Array of volatility values (0-100)
}

/**
 * VolatilityWaveform Component
 * 
 * Displays a small waveform visualization of volatility over time
 * Higher values create taller peaks in the waveform
 */
const VolatilityWaveform: React.FC<VolatilityWaveformProps> = ({ data }) => {
  // Ensure we have data to display
  if (!data || data.length === 0) {
    return <div className="h-6 w-20 bg-gray-800/30 rounded animate-pulse" />;
  }
  
  // Normalize data to ensure all values are between 0 and 100
  const normalizedData = data.map(value => Math.min(100, Math.max(0, value)));
  
  // Calculate average volatility for color determination
  const avgVolatility = normalizedData.reduce((sum, val) => sum + val, 0) / normalizedData.length;
  
  // Determine color based on average volatility
  const getColor = () => {
    if (avgVolatility > 75) return 'stroke-red-500';
    if (avgVolatility > 50) return 'stroke-orange-500';
    if (avgVolatility > 25) return 'stroke-yellow-500';
    return 'stroke-blue-500';
  };
  
  // Create SVG path for the waveform
  const createPath = () => {
    const height = 24; // SVG height
    const width = 80; // SVG width
    const points = normalizedData.length;
    const segmentWidth = width / (points - 1);
    
    let path = `M 0,${height - (normalizedData[0] / 100 * height)}`;
    
    for (let i = 1; i < points; i++) {
      const x = i * segmentWidth;
      const y = height - (normalizedData[i] / 100 * height);
      path += ` L ${x},${y}`;
    }
    
    return path;
  };
  
  return (
    <div className="inline-block" title={`Volatility trend: avg ${Math.round(avgVolatility)}%`}>
      <svg width="80" height="24" className="overflow-visible">
        <path
          d={createPath()}
          fill="none"
          className={`${getColor()} stroke-2`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default VolatilityWaveform;
