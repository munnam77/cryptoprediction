import React from 'react';

interface PumpProbabilityDialProps {
  probability: number; // 0-100
  timeframe?: '15m' | '30m' | '1h' | '4h' | '1d';
  className?: string;
}

/**
 * PumpProbabilityDial Component
 * Shows a tiny dial indicating the probability of a price pump
 */
const PumpProbabilityDial: React.FC<PumpProbabilityDialProps> = ({
  probability,
  timeframe = '1h',
  className = ''
}) => {
  // Normalize probability to 0-100 range
  const normalizedProbability = Math.min(100, Math.max(0, probability));
  
  // Calculate rotation angle for the needle (0-180 degrees)
  const rotationAngle = (normalizedProbability / 100) * 180;
  
  // Get color based on probability
  const getColor = () => {
    if (normalizedProbability >= 75) return 'text-green-500';
    if (normalizedProbability >= 50) return 'text-yellow-500';
    if (normalizedProbability >= 25) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Get glow effect based on probability
  const getGlowEffect = () => {
    if (normalizedProbability >= 75) return 'shadow-glow-green';
    if (normalizedProbability >= 50) return 'shadow-glow-yellow';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let probabilityText;
    if (normalizedProbability >= 75) probabilityText = 'Very High';
    else if (normalizedProbability >= 50) probabilityText = 'High';
    else if (normalizedProbability >= 25) probabilityText = 'Medium';
    else probabilityText = 'Low';
    
    return `${probabilityText} pump probability (${normalizedProbability.toFixed(0)}%) in ${timeframe}`;
  };
  
  return (
    <div className={`relative group ${className}`}>
      <div 
        className="relative w-10 h-10"
        title={getTooltip()}
      >
        {/* Dial background */}
        <svg width="40" height="40" viewBox="0 0 40 40">
          {/* Dial background */}
          <path 
            d="M5 20 A15 15 0 0 1 35 20" 
            fill="none" 
            stroke="#374151" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          {/* Colored progress arc */}
          <path 
            d={`M5 20 A15 15 0 0 1 ${5 + 30 * (normalizedProbability / 100)} 20`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
            className={getColor()}
          />
          
          {/* Dial center point */}
          <circle cx="20" cy="20" r="2" fill="#6B7280" />
          
          {/* Dial needle */}
          <line 
            x1="20" 
            y1="20" 
            x2="20" 
            y2="8" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            className={`${getColor()} ${getGlowEffect()}`}
            transform={`rotate(${rotationAngle} 20 20)`}
          />
        </svg>
        
        {/* Probability percentage */}
        <div className={`absolute bottom-0 left-0 right-0 text-center text-xs font-medium ${getColor()}`}>
          {normalizedProbability.toFixed(0)}%
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
        {getTooltip()}
      </div>
    </div>
  );
};

export default PumpProbabilityDial;
