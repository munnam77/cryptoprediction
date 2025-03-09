import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ScalpersCountdownProps {
  seconds: number;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  className?: string;
}

/**
 * ScalpersCountdown Component
 * Shows circular timer countdown until next data refresh
 */
const ScalpersCountdown: React.FC<ScalpersCountdownProps> = ({ 
  seconds, 
  timeframe,
  className = ''
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);
  
  useEffect(() => {
    // Reset when seconds prop changes
    setRemainingSeconds(seconds);
    
    // Set up the countdown timer
    const timer = setInterval(() => {
      setRemainingSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [seconds]);
  
  // Format time for display
  const formatTime = () => {
    if (remainingSeconds < 60) {
      return `${remainingSeconds}s`;
    } 
    
    const minutes = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${secs}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };
  
  // Calculate percentage for the circle
  const calculatePercentage = () => {
    let totalSeconds = 0;
    
    switch (timeframe) {
      case '15m': totalSeconds = 15 * 60; break;
      case '30m': totalSeconds = 30 * 60; break;
      case '1h': totalSeconds = 60 * 60; break;
      case '4h': totalSeconds = 4 * 60 * 60; break;
      case '1d': totalSeconds = 24 * 60 * 60; break;
    }
    
    return 100 - ((remainingSeconds / totalSeconds) * 100);
  };
  
  // Determine color based on remaining time
  const getColor = () => {
    if (remainingSeconds < 60) return '#ef4444'; // Red for < 1 minute
    if (remainingSeconds < 5 * 60) return '#f59e0b'; // Amber for < 5 minutes
    return '#3b82f6'; // Blue for >= 5 minutes
  };
  
  const circleSize = 30;
  const strokeWidth = 3;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (calculatePercentage() / 100) * circumference;
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex-shrink-0">
        <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className="w-3 h-3 text-gray-300" />
        </div>
      </div>
      <span className="ml-2 text-xs font-medium" style={{ color: getColor() }}>
        {formatTime()} to {timeframe} update
      </span>
    </div>
  );
};

export default ScalpersCountdown;
