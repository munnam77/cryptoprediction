import React, { useState, useRef, ReactNode, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // delay in ms before showing tooltip
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate position when tooltip becomes visible
  useEffect(() => {
    if (isVisible && tooltipRef.current && targetRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const targetRect = targetRef.current.getBoundingClientRect();
      
      // Calculate position based on props
      let x = 0;
      let y = 0;
      
      switch (position) {
        case 'top':
          x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          y = targetRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          y = targetRect.bottom + 8;
          break;
        case 'left':
          x = targetRect.left - tooltipRect.width - 8;
          y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          break;
        case 'right':
          x = targetRect.right + 8;
          y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          break;
      }
      
      // Adjust if tooltip would be off-screen
      const padding = 10; // minimum distance from edge of screen
      
      // Adjust x if needed
      if (x < padding) {
        x = padding;
      } else if (x + tooltipRect.width > window.innerWidth - padding) {
        x = window.innerWidth - tooltipRect.width - padding;
      }
      
      // Adjust y if needed
      if (y < padding) {
        y = padding;
      } else if (y + tooltipRect.height > window.innerHeight - padding) {
        y = window.innerHeight - tooltipRect.height - padding;
      }
      
      setCoords({ x, y });
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set timer for showing tooltip
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setIsVisible(false);
  };

  // Directional arrow classes
  const getArrowClass = () => {
    switch (position) {
      case 'top':
        return 'after:top-full after:border-t-gray-800';
      case 'bottom':
        return 'after:bottom-full after:border-b-gray-800';
      case 'left':
        return 'after:left-full after:border-l-gray-800';
      case 'right':
        return 'after:right-full after:border-r-gray-800';
      default:
        return 'after:top-full after:border-t-gray-800';
    }
  };
  
  return (
    <div
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={targetRef}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg ${getArrowClass()} ${className}`}
          style={{
            transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
            left: `${coords.x}px`,
            top: `${coords.y}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;