import React from 'react';

interface PricePivotDotProps {
  price: number;
  pivotPoints: number[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * PricePivotDot Component
 * Displays a cyan dot on a mini price line indicating a pivot point
 */
const PricePivotDot: React.FC<PricePivotDotProps> = ({
  price,
  pivotPoints,
  width = 80,
  height = 20,
  className = ''
}) => {
  // Format price based on magnitude
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${value.toFixed(2)}`;
    } else if (value >= 1) {
      return `$${value.toFixed(3)}`;
    } else if (value >= 0.01) {
      return `$${value.toFixed(4)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };
  
  // Find min and max prices from history including current and pivot
  const allPrices = [...pivotPoints, price];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  
  // Calculate position for pivot dot (as percentage of height from bottom)
  const pivotPosition = priceRange > 0 
    ? ((pivotPoints[0] - minPrice) / priceRange) * 100 
    : 50;
  
  // Generate path for price line
  const generatePath = () => {
    if (pivotPoints.length === 0) return '';
    
    const points = pivotPoints.map((price, index) => {
      const x = (index / (pivotPoints.length - 1)) * width;
      const y = height - ((price - minPrice) / priceRange) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };
  
  return (
    <div 
      className={`relative ${className}`}
      title={`Pivot: ${formatPrice(pivotPoints[0])}`}
    >
      <svg width={width} height={height} className="overflow-visible">
        {/* Price history line */}
        {pivotPoints.length > 1 && (
          <path
            d={generatePath()}
            fill="none"
            stroke="rgba(148, 163, 184, 0.5)"
            strokeWidth="1.5"
            className="dark:stroke-gray-600"
          />
        )}
        
        {/* Current price point */}
        <circle
          cx={width}
          cy={height - ((price - minPrice) / priceRange) * height}
          r="2"
          fill="#6366f1"
          className="dark:fill-indigo-400"
        />
        
        {/* Pivot price line (horizontal dashed) */}
        <line
          x1="0"
          y1={height - (pivotPosition / 100) * height}
          x2={width}
          y2={height - (pivotPosition / 100) * height}
          stroke="#06b6d4"
          strokeWidth="1"
          strokeDasharray="2,2"
          className="dark:stroke-cyan-500"
        />
        
        {/* Pivot price dot */}
        <circle
          cx={width / 2}
          cy={height - (pivotPosition / 100) * height}
          r="3"
          fill="#06b6d4"
          className="dark:fill-cyan-500 animate-pulse"
        />
      </svg>
      
      {/* Pivot price label */}
      <div className="absolute -right-2 top-full mt-1 text-xs text-cyan-600 dark:text-cyan-400 font-mono">
        {formatPrice(pivotPoints[0])}
      </div>
    </div>
  );
};

export default PricePivotDot;
