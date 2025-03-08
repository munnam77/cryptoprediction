import React, { useState, useEffect } from 'react';

type FlashSentimentSpikeProps = {
  postCount: number; // Number of new social media posts
  active: boolean; // Whether the spike is currently active
  size?: number;
  className?: string;
};

/**
 * Flash Sentiment Spike - Yellow burst animation
 * Visually indicates a sudden increase in social media mentions
 */
const FlashSentimentSpike: React.FC<FlashSentimentSpikeProps> = ({
  postCount,
  active,
  size = 60,
  className = '',
}) => {
  // State to control animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Effect to trigger animation when active prop changes
  useEffect(() => {
    if (active) {
      setIsAnimating(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [active]);
  
  // Tooltip content
  const tooltipContent = `${postCount} new posts detected`;
  
  // Calculate burst rays based on size
  const numRays = 12;
  const rayLength = size * 0.4;
  const innerRadius = size * 0.15;
  const outerRadius = size * 0.3;
  
  // Create ray coordinates
  const createRays = () => {
    const rays = [];
    const centerX = size / 2;
    const centerY = size / 2;
    
    for (let i = 0; i < numRays; i++) {
      const angle = (i * 2 * Math.PI) / numRays;
      const startX = centerX + Math.cos(angle) * innerRadius;
      const startY = centerY + Math.sin(angle) * innerRadius;
      const endX = centerX + Math.cos(angle) * (innerRadius + rayLength);
      const endY = centerY + Math.sin(angle) * (innerRadius + rayLength);
      
      rays.push({ startX, startY, endX, endY });
    }
    
    return rays;
  };
  
  const rays = createRays();
  
  return (
    <div 
      className={`relative ${className}`} 
      title={tooltipContent}
      style={{ width: size, height: size }}
    >
      {/* SVG for burst animation */}
      <svg 
        width={size} 
        height={size} 
        className="absolute top-0 left-0"
      >
        {/* Center circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill="#fef08a" // Yellow-100
          className={`${isAnimating ? 'animate-ping' : ''}`}
          style={{ opacity: isAnimating ? 0.7 : 0, animationDuration: '1s' }}
        />
        
        {/* Outer glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          fill="url(#sentimentGradient)"
          className={`${isAnimating ? 'animate-pulse' : ''}`}
          style={{ 
            opacity: isAnimating ? 0.5 : 0, 
            animationDuration: '0.8s',
            filter: 'blur(4px)'
          }}
        />
        
        {/* Gradient definition */}
        <defs>
          <radialGradient id="sentimentGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="1" /> {/* Yellow-500 */}
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Burst rays */}
        {rays.map((ray, index) => (
          <line
            key={index}
            x1={ray.startX}
            y1={ray.startY}
            x2={ray.endX}
            y2={ray.endY}
            stroke="#facc15" // Yellow-500
            strokeWidth="2"
            strokeLinecap="round"
            className={`${isAnimating ? 'animate-flash-ray' : ''}`}
            style={{ 
              opacity: isAnimating ? 0.8 : 0,
              animationDelay: `${index * 30}ms`,
              animationDuration: '0.5s',
              transformOrigin: `${size / 2}px ${size / 2}px`
            }}
          />
        ))}
        
        {/* Post count text */}
        {isAnimating && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#1e293b" // Slate-800
            className="animate-fade-in"
          >
            {postCount}
          </text>
        )}
      </svg>
      
      {/* Small indicator when not animating but posts are high */}
      {!isAnimating && postCount > 20 && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      )}
    </div>
  );
};

// Add custom animation keyframes to your CSS
// You'll need to add these to your global CSS
/*
@keyframes flash-ray {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1); }
}

.animate-flash-ray {
  animation: flash-ray 0.5s ease-out forwards;
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
*/

export default FlashSentimentSpike;
