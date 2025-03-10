import React, { useEffect, useState } from 'react';

interface DynamicBackgroundShiftProps {
  sentiment: number; // 0-100 scale
}

/**
 * DynamicBackgroundShift Component
 * 
 * Creates a subtle background gradient shift based on market sentiment
 */
const DynamicBackgroundShift: React.FC<DynamicBackgroundShiftProps> = ({ sentiment }) => {
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 });
  
  // Update gradient based on sentiment
  useEffect(() => {
    // Map sentiment (0-100) to x position (30-70)
    const x = 30 + (sentiment / 100) * 40;
    
    // Set a complementary y position
    const y = 100 - x;
    
    setGradientPosition({ x, y });
  }, [sentiment]);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none transition-all duration-5000 ease-in-out"
      style={{
        background: `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0) 70%)`,
        zIndex: 0
      }}
    />
  );
};

export default DynamicBackgroundShift;
