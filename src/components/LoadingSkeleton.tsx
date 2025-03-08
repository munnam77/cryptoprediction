import React from 'react';

interface LoadingSkeletonProps {
  type?: 'text' | 'card' | 'chart';
  count?: number;
}

function LoadingSkeleton({ type = 'text', count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-600 rounded"></div>
              <div className="h-3 bg-gray-600 rounded w-5/6"></div>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-48 bg-gray-600 rounded"></div>
          </div>
        );
      default:
        return (
          <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;