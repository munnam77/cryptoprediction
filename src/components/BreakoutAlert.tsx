import React from 'react';
import { Star } from 'lucide-react';
import Badge from './ui/Badge';

interface BreakoutAlertProps {
  breakout: {
    price: number;
    type: 'resistance' | 'support';
    time: number;
  };
  currentPrice: number;
  className?: string;
}

/**
 * BreakoutAlert Component
 * Displays an orange star badge that pulses when price breaks resistance
 */
const BreakoutAlert: React.FC<BreakoutAlertProps> = ({
  breakout,
  currentPrice,
  className = ''
}) => {
  if (!breakout || typeof currentPrice !== 'number') {
    return null;
  }

  // Only show if current price is beyond breakout price
  const shouldShow = breakout.type === 'resistance' 
    ? currentPrice > breakout.price
    : currentPrice < breakout.price;

  if (!shouldShow) {
    return null;
  }
  
  // Format the price based on its magnitude
  const formatPrice = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0.00';
    }
    
    try {
      if (value >= 1000) {
        return `$${value.toFixed(2)}`;
      } else if (value >= 1) {
        return `$${value.toFixed(3)}`;
      } else if (value >= 0.01) {
        return `$${value.toFixed(4)}`;
      } else {
        return `$${value.toFixed(6)}`;
      }
    } catch (e) {
      console.error('Price formatting error:', e);
      return '$0.00';
    }
  };
  
  return (
    <Badge
      variant="breakout"
      pulse={true}
      tooltip={`Broke ${breakout.type} at ${formatPrice(breakout.price)} at ${new Date(breakout.time).toLocaleTimeString()}`}
      className={`flex items-center space-x-1 ${className}`}
    >
      <Star className="w-3 h-3 text-orange-500" />
      <span>Broke {formatPrice(breakout.price)}</span>
    </Badge>
  );
};

export default BreakoutAlert;
