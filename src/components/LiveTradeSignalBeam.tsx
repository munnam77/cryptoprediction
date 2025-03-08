import React, { useEffect, useState } from 'react';

interface LiveTradeSignalBeamProps {
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
  source: string;
  className?: string;
}

/**
 * LiveTradeSignalBeam Component
 * Animated beam showing buy/sell signals from trading algorithms
 */
const LiveTradeSignalBeam: React.FC<LiveTradeSignalBeamProps> = ({
  signal,
  strength,
  source,
  className = ''
}) => {
  // Ensure strength is between 0-100
  const validStrength = Math.min(Math.max(strength, 0), 100);
  
  // Animation state
  const [beamWidth, setBeamWidth] = useState(0);
  
  // Get color based on signal
  const getColor = () => {
    if (signal === 'buy') return 'bg-green-500';
    if (signal === 'sell') return 'bg-red-500';
    return 'bg-gray-500';
  };
  
  // Get opacity based on strength
  const getOpacity = () => {
    return 0.3 + (validStrength / 100) * 0.7; // Between 0.3 and 1.0
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let strengthText = '';
    
    if (validStrength >= 80) strengthText = 'Very strong';
    else if (validStrength >= 60) strengthText = 'Strong';
    else if (validStrength >= 40) strengthText = 'Moderate';
    else if (validStrength >= 20) strengthText = 'Weak';
    else strengthText = 'Very weak';
    
    const signalText = signal.charAt(0).toUpperCase() + signal.slice(1);
    
    return `${strengthText} ${signalText} signal (${validStrength}%) from ${source}`;
  };
  
  // Beam animation
  useEffect(() => {
    // Skip animation for neutral signals
    if (signal === 'neutral') {
      setBeamWidth(0);
      return;
    }
    
    // Animate beam width
    const animateBeam = () => {
      // Reset beam
      setBeamWidth(0);
      
      // Expand beam
      setTimeout(() => {
        setBeamWidth(100);
      }, 100);
      
      // Contract beam
      setTimeout(() => {
        setBeamWidth(0);
      }, 1500);
    };
    
    // Initial animation
    animateBeam();
    
    // Set interval for repeated animation
    const intervalId = setInterval(animateBeam, 3000);
    
    return () => clearInterval(intervalId);
  }, [signal]);
  
  return (
    <div 
      className={`relative h-6 ${className}`}
      title={getTooltip()}
    >
      {/* Signal label */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span className={`text-xs font-medium ${signal === 'neutral' ? 'text-gray-500' : 'text-white'}`}>
          {signal.toUpperCase()} {validStrength}%
        </span>
      </div>
      
      {/* Animated beam */}
      <div 
        className={`absolute inset-y-0 left-0 ${getColor()} transition-all duration-1000 rounded-md`}
        style={{ 
          width: `${beamWidth}%`,
          opacity: getOpacity()
        }}
      />
      
      {/* Static background */}
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-md" />
    </div>
  );
};

export default LiveTradeSignalBeam;
