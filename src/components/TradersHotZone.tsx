import React from 'react';

interface TradersHotZoneProps {
  zones: Array<{
    price: number;
    intensity: number;
  }>;
  currentPrice: number;
  className?: string;
}

/**
 * TradersHotZone Component
 * Visualizes areas of high trading activity as a heatmap
 */
const TradersHotZone: React.FC<TradersHotZoneProps> = ({
  zones = [],
  currentPrice,
  className = ''
}) => {
  if (!zones.length || !currentPrice) return null;

  // Sort zones by price for visualization
  const sortedZones = [...zones].sort((a, b) => a.price - b.price);
  
  // Find min/max prices for scaling
  const minPrice = Math.min(...zones.map(z => z.price));
  const maxPrice = Math.max(...zones.map(z => z.price));
  const priceRange = maxPrice - minPrice || 1;

  // Format price for tooltip
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(3);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div 
      className={`relative h-1.5 bg-gray-700/30 rounded-full overflow-hidden ${className}`}
      title={`${zones.length} trading zones identified`}
    >
      {/* Render each zone as a heat spot */}
      {sortedZones.map((zone, index) => {
        const position = ((zone.price - minPrice) / priceRange) * 100;
        const width = Math.max(4, (zone.intensity / 100) * 12); // 4-12px width based on intensity
        
        return (
          <div
            key={index}
            className="absolute top-0 bottom-0 rounded-full bg-orange-500"
            style={{
              left: `${position}%`,
              width: `${width}px`,
              transform: 'translateX(-50%)',
              opacity: zone.intensity / 100,
            }}
            title={`Trading zone at $${formatPrice(zone.price)} (${zone.intensity.toFixed(0)}% intensity)`}
          />
        );
      })}

      {/* Current price indicator */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white"
        style={{
          left: `${((currentPrice - minPrice) / priceRange) * 100}%`,
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
};

export default TradersHotZone;
