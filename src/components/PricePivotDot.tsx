import React from 'react';

interface PricePivotDotProps {
  pivotPoint: {
    price: number;
    type: 'resistance' | 'support';
    strength: number;
  };
  currentPrice: number;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * PricePivotDot Component
 * Displays a cyan dot on a mini price line indicating a pivot point
 */
const PricePivotDot: React.FC<PricePivotDotProps> = ({
  pivotPoint,
  currentPrice,
  width = 80,
  height = 20,
  className = ''
}) => {
  if (!pivotPoint?.price || !currentPrice) {
    return null;
  }

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
  
  // Calculate price range
  const minPrice = Math.min(pivotPoint.price, currentPrice);
  const maxPrice = Math.max(pivotPoint.price, currentPrice);
  const priceRange = maxPrice - minPrice || 1; // Prevent division by zero
  
  // Calculate position for pivot dot (as percentage of height from bottom)
  const pivotPosition = ((pivotPoint.price - minPrice) / priceRange) * 100;
  const currentPosition = ((currentPrice - minPrice) / priceRange) * 100;
  
  // Determine dot color based on type and strength
  const getDotColor = () => {
    const baseColor = pivotPoint.type === 'support' ? 'cyan' : 'indigo';
    const intensity = Math.round((pivotPoint.strength / 100) * 500 / 100) * 100;
    return `var(--${baseColor}-${intensity})`;
  };

  return (
    <div 
      className={`relative ${className}`}
      title={`${pivotPoint.type.charAt(0).toUpperCase() + pivotPoint.type.slice(1)} at ${formatPrice(pivotPoint.price)} (Strength: ${pivotPoint.strength})`}
    >
      <svg width={width} height={height} className="overflow-visible">
        {/* Line connecting current price to pivot */}
        <line
          x1={width * 0.2}
          y1={height - (pivotPosition / 100) * height}
          x2={width * 0.8}
          y2={height - (currentPosition / 100) * height}
          stroke="rgba(148, 163, 184, 0.5)"
          strokeWidth="1"
          className="dark:stroke-gray-600"
        />
        
        {/* Current price point */}
        <circle
          cx={width * 0.8}
          cy={height - (currentPosition / 100) * height}
          r="2"
          fill="#6366f1"
          className="dark:fill-indigo-400"
        />
        
        {/* Pivot price dot */}
        <circle
          cx={width * 0.2}
          cy={height - (pivotPosition / 100) * height}
          r={2 + (pivotPoint.strength / 100) * 2}
          fill={getDotColor()}
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </svg>
      
      {/* Pivot price label */}
      <div 
        className={`absolute left-0 -bottom-4 text-[8px] ${
          pivotPoint.type === 'support' ? 'text-cyan-500' : 'text-indigo-500'
        }`}
      >
        {formatPrice(pivotPoint.price)}
      </div>
    </div>
  );
};

export default PricePivotDot;
