import React from 'react';

interface LoadingSkeletonProps {
  type: 'table' | 'cards' | 'predictions';
  rows?: number;
  count?: number;
  className?: string;
}

/**
 * LoadingSkeleton Component
 * Provides animated loading states for different parts of the UI
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  rows = 5,
  count = 1,
  className = ''
}) => {
  const getSkeletonPattern = () => {
    switch (type) {
      case 'table':
        return (
          <div className="animate-pulse">
            {Array.from({ length: rows }).map((_, i) => (
              <div 
                key={i} 
                className="flex items-center space-x-4 py-3 border-b border-gray-700/30"
              >
                <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
                <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                <div className="w-20 h-4 bg-gray-700/50 rounded"></div>
                <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
                <div className="flex-1">
                  <div className="w-full h-1 bg-gray-700/30 rounded">
                    <div className="w-3/4 h-full bg-gray-700/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'cards':
        return (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <div 
                key={i} 
                className="animate-pulse p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-20 h-5 bg-gray-700/50 rounded"></div>
                  <div className="w-12 h-5 bg-gray-700/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gray-700/50 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-700/50 rounded"></div>
                  <div className="flex justify-between mt-4">
                    <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                    <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'predictions':
        return (
          <div className="animate-pulse space-y-4">
            {/* Header skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="w-32 h-5 bg-gray-700/50 rounded"></div>
              <div className="w-24 h-5 bg-gray-700/50 rounded"></div>
            </div>
            
            {/* Prediction rows */}
            {Array.from({ length: rows }).map((_, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-3 border-b border-gray-700/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700/50 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
                    <div className="w-16 h-3 bg-gray-700/30 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-4 bg-gray-700/50 rounded"></div>
                  <div className="w-16 h-4 bg-gray-700/50 rounded"></div>
                  <div className="w-12 h-8 bg-gray-700/50 rounded"></div>
                </div>
              </div>
            ))}
            
            {/* Bottom metrics skeleton */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i}
                  className="p-3 bg-gray-700/20 rounded-lg space-y-2"
                >
                  <div className="w-16 h-3 bg-gray-700/50 rounded"></div>
                  <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      {getSkeletonPattern()}
    </div>
  );
};

export default LoadingSkeleton;