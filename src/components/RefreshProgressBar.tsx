import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshProgressBarProps {
  progress: number; // 0-100
  onRefresh?: () => void;
  className?: string;
}

/**
 * RefreshProgressBar Component
 * Shows a progress bar for the 30-second refresh cycle
 */
const RefreshProgressBar: React.FC<RefreshProgressBarProps> = ({
  progress,
  onRefresh,
  className = ''
}) => {
  // Normalize progress to ensure it's between 0-100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  // Get color based on progress
  const getColor = () => {
    if (normalizedProgress > 66) return 'bg-green-500';
    if (normalizedProgress > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const secondsRemaining = Math.ceil((normalizedProgress / 100) * 30);
    return `${secondsRemaining}s`;
  };
  
  // Determine if we should show the animated stripes
  const isRefreshing = normalizedProgress < 100;
  
  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={onRefresh}
        className={`p-1 rounded-full hover:bg-gray-700 mr-2 transition-colors ${
          isRefreshing ? 'animate-spin text-blue-400' : 'text-gray-400'
        }`}
        title="Force refresh"
      >
        <RefreshCw size={16} />
      </button>
      
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all duration-1000 ease-linear ${
            isRefreshing ? 'animate-progress-bar-stripes' : ''
          }`}
          style={{ width: `${normalizedProgress}%` }}
        ></div>
      </div>
      
      <div className="ml-2 text-xs text-gray-400 min-w-[30px] text-right">
        {formatTimeRemaining()}
      </div>
    </div>
  );
};

export default RefreshProgressBar; 