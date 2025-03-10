import React, { useState, useEffect } from 'react';

/**
 * RefreshProgressBar Component
 * 
 * Displays a progress bar that shows the time until the next data refresh
 */
const RefreshProgressBar: React.FC = () => {
  const [progress, setProgress] = useState<number>(100);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Simulate a 60-second refresh cycle
  useEffect(() => {
    const refreshInterval = 60000; // 60 seconds
    const updateInterval = 1000; // Update every second
    const steps = refreshInterval / updateInterval;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep = (currentStep + 1) % steps;
      
      // Calculate progress (100% to 0% and back to 100%)
      const newProgress = 100 - ((currentStep / steps) * 100);
      setProgress(newProgress);
      
      // Show refreshing animation when progress is near 0
      setIsRefreshing(newProgress < 5);
    }, updateInterval);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get color based on progress
  const getColor = () => {
    if (progress > 66) return 'bg-green-500';
    if (progress > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Next refresh</span>
        <span className="text-xs font-medium">
          {isRefreshing ? 'Refreshing...' : `${Math.ceil(progress / (100/60))}s`}
        </span>
      </div>
      <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-1000 ${isRefreshing ? 'animate-pulse' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default RefreshProgressBar; 