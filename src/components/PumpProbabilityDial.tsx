import React from 'react';

interface PumpProbabilityDialProps {
  probability: number; // 0-100
  timeframe: string;
  className?: string;
  size?: number;
}

/**
 * PumpProbabilityDial Component
 * Semicircular gauge showing likelihood of price pump
 */
const PumpProbabilityDial: React.FC<PumpProbabilityDialProps> = ({
  probability,
  timeframe,
  className = '',
  size = 80
}) => {
  // Ensure probability is between 0-100
  const validProbability = Math.min(Math.max(probability, 0), 100);
  
  // Calculate dimensions
  const radius = size / 2;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI;
  
  // Calculate stroke dash based on probability (semicircle)
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (validProbability / 100) * circumference;
  
  // Get color based on probability
  const getColor = () => {
    if (validProbability >= 70) return 'text-green-500';
    if (validProbability >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get label text
  const getLabel = () => {
    if (validProbability >= 70) return 'High';
    if (validProbability >= 40) return 'Medium';
    return 'Low';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    return `Pump probability: ${validProbability}% (${getLabel()}) for ${timeframe} timeframe`;
  };
  
  return (
    <div 
      className={`relative flex flex-col items-center ${className}`}
      title={getTooltip()}
    >
      <svg
        height={radius}
        width={size}
        className="transform rotate-180"
      >
        {/* Background semicircle */}
        <path
          d={`
            M ${strokeWidth/2}, ${radius}
            a ${normalizedRadius}, ${normalizedRadius} 0 1,1 ${size - strokeWidth}, 0
          `}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Foreground semicircle (progress) */}
        <path
          d={`
            M ${strokeWidth/2}, ${radius}
            a ${normalizedRadius}, ${normalizedRadius} 0 1,1 ${size - strokeWidth}, 0
          `}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getColor()}
        />
      </svg>
      
      {/* Probability text */}
      <div className="flex flex-col items-center mt-1">
        <span className={`text-lg font-bold ${getColor()}`}>
          {validProbability}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getLabel()}
        </span>
      </div>
    </div>
  );
};

export default PumpProbabilityDial;
