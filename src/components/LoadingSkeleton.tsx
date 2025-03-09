import React from 'react';

interface LoadingSkeletonProps {
  type: 'table' | 'cards' | 'predictions';
  rows?: number;
  count?: number;
}

/**
 * LoadingSkeleton Component
 * Provides animated loading states for different parts of the UI
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type, 
  rows = 5,
  count = 3 
}) => {
  const renderTableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-700 rounded mb-3 w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-2 mb-2">
          <div className="h-8 bg-gray-700 rounded col-span-1"></div>
          <div className="h-8 bg-gray-700 rounded col-span-1"></div>
          <div className="h-8 bg-gray-700 rounded col-span-1"></div>
          <div className="h-8 bg-gray-700 rounded col-span-1"></div>
          <div className="h-8 bg-gray-700 rounded col-span-1"></div>
        </div>
      ))}
    </div>
  );

  const renderCardsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-700 rounded-lg h-[120px]"></div>
      ))}
    </div>
  );
  
  const renderPredictionsSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-700 rounded w-1/3"></div>
        <div className="h-5 bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="h-6 bg-gray-700 rounded mb-3 w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'table':
      return renderTableSkeleton();
    case 'cards':
      return renderCardsSkeleton();
    case 'predictions':
      return renderPredictionsSkeleton();
    default:
      return null;
  }
};

export default LoadingSkeleton;