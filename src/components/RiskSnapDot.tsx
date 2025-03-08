import React from 'react';

interface RiskSnapDotProps {
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskScore?: number; // 0-100
  className?: string;
  size?: number;
}

/**
 * RiskSnapDot Component
 * Color-coded dot showing trade risk level
 */
const RiskSnapDot: React.FC<RiskSnapDotProps> = ({
  riskLevel,
  riskScore,
  className = '',
  size = 12
}) => {
  // Get color based on risk level
  const getColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'extreme':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get border style based on risk level
  const getBorderStyle = () => {
    switch (riskLevel) {
      case 'high':
        return 'border border-orange-300 dark:border-orange-700';
      case 'extreme':
        return 'border-2 border-red-300 dark:border-red-700';
      default:
        return '';
    }
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const levelText = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    let tooltip = `${levelText} risk`;
    
    if (riskScore !== undefined) {
      tooltip += ` (${riskScore}/100)`;
    }
    
    return tooltip;
  };
  
  return (
    <div 
      className={`inline-block ${className}`}
      title={getTooltip()}
    >
      <div 
        className={`rounded-full ${getColor()} ${getBorderStyle()}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

export default RiskSnapDot;
