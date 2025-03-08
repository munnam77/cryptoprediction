import React from 'react';
import { Star } from 'lucide-react';
import Badge from './ui/Badge';

interface BreakoutAlertProps {
  price: number;
  breakoutPrice: number;
  breakoutType: 'support' | 'resistance';
  breakoutTime: string;
  className?: string;
}

/**
 * BreakoutAlert Component
 * Displays an orange star badge that pulses when price breaks resistance
 */
const BreakoutAlert: React.FC<BreakoutAlertProps> = ({
  price,
  breakoutPrice,
  breakoutType,
  breakoutTime,
  className = ''
}) => {
  // Only show if current price is above breakout price
  if (price <= breakoutPrice) {
    return null;
  }
  
  // Format the price based on its magnitude
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
  
  return (
    <Badge
      variant="breakout"
      pulse={true}
      tooltip={`Broke ${breakoutType} at ${formatPrice(breakoutPrice)} at ${breakoutTime}`}
      className={`flex items-center space-x-1 ${className}`}
    >
      <Star className="w-3 h-3 text-orange-500" />
      <span>Broke {formatPrice(breakoutPrice)}</span>
    </Badge>
  );
};

export default BreakoutAlert;
