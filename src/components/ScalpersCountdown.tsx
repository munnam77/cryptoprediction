import React, { useState, useEffect } from 'react';

interface ScalpersCountdownProps {
  remainingTime: number;
  duration: number;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  className?: string;
  size?: number;
}

/**
 * ScalpersCountdown Component
 * Circular timer showing countdown to next data refresh
 */
const ScalpersCountdown: React.FC<ScalpersCountdownProps> = ({
  remainingTime,
  duration,
  timeframe,
  className = '',
  size = 40
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(remainingTime);
  const [percentage, setPercentage] = useState<number>((remainingTime / duration) * 100);
  
  useEffect(() => {
    // Update time left
    const updateTimeLeft = () => {
      const newTimeLeft = Math.max(0, timeLeft - 1);
      setTimeLeft(newTimeLeft);
      
      // Calculate percentage for circle animation
      const newPercentage = (newTimeLeft / duration) * 100;
      setPercentage(newPercentage);
    };
    
    // Set interval for countdown
    const intervalId = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(intervalId);
  }, [timeLeft, duration]);
  
  // Format time left
  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // Calculate circle properties
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on time left
  const getColor = () => {
    // For 1m timeframe, less than 10 seconds is red
    if (timeframe === '1m' && timeLeft < 10) return 'text-red-500 stroke-red-500';
    // For 5m timeframe, less than 30 seconds is red
    if (timeframe === '5m' && timeLeft < 30) return 'text-red-500 stroke-red-500';
    // For 15m timeframe, less than 1 minute is red
    if (timeframe === '15m' && timeLeft < 60) return 'text-red-500 stroke-red-500';
    // For 1h timeframe, less than 5 minutes is red
    if (timeframe === '1h' && timeLeft < 300) return 'text-red-500 stroke-red-500';
    // For 4h timeframe, less than 15 minutes is red
    if (timeframe === '4h' && timeLeft < 900) return 'text-red-500 stroke-red-500';
    // For 1d timeframe, less than 30 minutes is red
    if (timeframe === '1d' && timeLeft < 1800) return 'text-red-500 stroke-red-500';
    
    // Default colors
    if (percentage < 25) return 'text-orange-500 stroke-orange-500';
    if (percentage < 50) return 'text-yellow-500 stroke-yellow-500';
    return 'text-blue-500 stroke-blue-500';
  };
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      title={`Next ${timeframe} update in ${formatTimeLeft()}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={getColor()}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Time text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-medium ${getColor()}`}>
          {formatTimeLeft()}
        </span>
      </div>
    </div>
  );
};

export default ScalpersCountdown;
