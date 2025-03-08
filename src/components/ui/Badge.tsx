import React, { useState, useEffect } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'breakout' | 'pump';
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
  tooltip?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  pulse = false,
  tooltip,
  onClick
}) => {
  const [isPulsing, setIsPulsing] = useState(pulse);
  
  // Reset pulsing state after 3 seconds if pulse is true
  useEffect(() => {
    setIsPulsing(pulse);
    
    if (pulse) {
      const timer = setTimeout(() => setIsPulsing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pulse]);
  
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'breakout':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border border-orange-500';
      case 'pump':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border border-purple-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${getVariantStyles()}
        ${isPulsing ? 'animate-pulse' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </span>
  );
};

export default Badge;
