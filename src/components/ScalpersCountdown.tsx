import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ScalpersCountdownProps {
  seconds: number;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  className?: string;
}

/**
 * ScalpersCountdown Component
 * Shows a circular timer counting down to the next data refresh
 */
const ScalpersCountdown: React.FC<ScalpersCountdownProps> = ({
  seconds,
  timeframe,
  className = ''
}) => {
  const [countdown, setCountdown] = useState(seconds);
  
  // Update countdown every second
  useEffect(() => {
    setCountdown(seconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          return seconds; // Reset to initial value when it reaches zero
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [seconds]);
  
  // Format time for display
  const formatTime = () => {
    if (countdown < 60) {
      return `${countdown}s`;
    } else if (countdown < 3600) {
      const minutes = Math.floor(countdown / 60);
      const secs = countdown % 60;
      return `${minutes}m${secs > 0 ? ` ${secs}s` : ''}`;
    } else {
      const hours = Math.floor(countdown / 3600);
      const minutes = Math.floor((countdown % 3600) / 60);
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
  };
  
  // Calculate progress percentage (0-100)
  const getProgress = () => {
    let totalSeconds;
    switch (timeframe) {
      case '15m': totalSeconds = 15 * 60; break;
      case '30m': totalSeconds = 30 * 60; break;
      case '1h': totalSeconds = 60 * 60; break;
      case '4h': totalSeconds = 4 * 60 * 60; break;
      case '1d': totalSeconds = 24 * 60 * 60; break;
      default: totalSeconds = 60 * 60;
    }
    
    return 100 - (countdown / totalSeconds * 100);
  };
  
  // Get color based on remaining time
  const getColor = () => {
    if (countdown < 60) return 'text-red-500'; // Less than 1 minute
    if (countdown < 300) return 'text-yellow-500'; // Less than 5 minutes
    return 'text-green-500';
  };
  
  // Calculate stroke dash values for circle progress
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (getProgress() / 100) * circumference;
  
  return (
    <div className={`relative group ${className}`}>
      <div className="flex items-center">
        {/* SVG Circle Progress */}
        <svg width="40" height="40" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="#374151"
            strokeWidth="3"
          />
          
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={getColor()}
          />
        </svg>
        
        {/* Time display */}
        <div className="ml-2">
          <div className="text-xs text-gray-400">Next Update</div>
          <div className={`text-sm font-medium ${getColor()}`}>{formatTime()}</div>
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
        {`${formatTime()} until ${timeframe} update`}
      </div>
    </div>
  );
};

export default ScalpersCountdown;
