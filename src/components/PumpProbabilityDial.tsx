import React from 'react';

interface PumpProbabilityDialProps {
  probability: number; // 0-100
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  className?: string;
}

/**
 * PumpProbabilityDial Component
 * Shows the probability of a price pump in the selected timeframe
 */
const PumpProbabilityDial: React.FC<PumpProbabilityDialProps> = ({
  probability = 0,
  timeframe,
  className = ''
}) => {
  // Ensure probability is within 0-100 range
  const validProbability = Math.min(Math.max(Math.round(probability), 0), 100);
  
  // Calculate SVG parameters
  const size = 40;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (validProbability / 100) * circumference;
  
  // Get color based on probability value
  const getColor = () => {
    if (validProbability < 30) return '#9ca3af'; // Gray for low probability
    if (validProbability < 60) return '#facc15'; // Yellow for medium probability
    if (validProbability < 80) return '#fb923c'; // Orange for high probability
    return '#4ade80'; // Green for very high probability
  };
  
  const color = getColor();
  
  // Get appropriate label for the timeframe
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case '15m': return '15m';
      case '30m': return '30m';
      case '1h': return '1h';
      case '4h': return '4h';
      case '1d': return '1d';
      default: return timeframe;
    }
  };
  
  // Get tooltip text
  const getTooltipText = () => {
    let strength = 'Low';
    if (validProbability >= 30) strength = 'Moderate';
    if (validProbability >= 60) strength = 'High';
    if (validProbability >= 80) strength = 'Very High';
    
    return `${strength} probability (${validProbability}%) of price pump in ${getTimeframeLabel()} timeframe`;
  };
  
  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      title={getTooltipText()}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        
        {/* Probability circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease'
          }}
        />
      </svg>
      
      {/* Probability text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-xs font-semibold"
          style={{ color }}
        >
          {validProbability}%
        </span>
      </div>
      
      {/* Timeframe indicator */}
      <span className="ml-1 text-xs text-gray-400">
        {getTimeframeLabel()}
      </span>
    </div>
  );
};

export default PumpProbabilityDial;
