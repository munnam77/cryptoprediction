import React, { useEffect, useState } from 'react';

type DynamicBackgroundShiftProps = {
  marketSentiment?: number; // 0-100 sentiment score, influences colors
  volatility?: number; // 0-100 volatility score, influences transition speed
  className?: string;
};

/**
 * Dynamic Background Shift - Slow gradient transition
 * Creates a subtle shifting background gradient based on market conditions
 */
const DynamicBackgroundShift: React.FC<DynamicBackgroundShiftProps> = ({
  marketSentiment = 50,
  volatility = 30,
  className = '',
}) => {
  // Color palettes based on market sentiment
  const getColorPalette = () => {
    // Extremely bullish - vibrant blue to emerald
    if (marketSentiment >= 85) {
      return ['#0c4a6e', '#10b981', '#0284c7'];
    }
    // Bullish - blue to emerald
    if (marketSentiment >= 70) {
      return ['#0c4a6e', '#10b981', '#0f766e'];
    }
    // Slightly bullish - sea blue to teal
    if (marketSentiment >= 55) {
      return ['#1e3a8a', '#0d9488', '#164e63'];
    }
    // Neutral - deep blue to indigo
    if (marketSentiment >= 45) {
      return ['#1e1b4b', '#374151', '#292524'];
    }
    // Slightly bearish - purple to navy
    if (marketSentiment >= 35) {
      return ['#4c1d95', '#1e1b4b', '#312e81'];
    }
    // Bearish - deep purple to dark red
    if (marketSentiment >= 20) {
      return ['#581c87', '#7f1d1d', '#3b0764'];
    }
    // Extremely bearish - deep red to black
    return ['#7f1d1d', '#0f172a', '#450a0a'];
  };

  // Initial state for gradient colors and positions
  const [gradientState, setGradientState] = useState({
    colors: getColorPalette(),
    positions: [0, 33, 66], // Initial positions (percentage)
    transitionSpeed: Math.max(30, 60 - volatility / 3) // Seconds for transition
  });

  // Update gradient parameters when market sentiment or volatility changes
  useEffect(() => {
    setGradientState(prevState => ({
      ...prevState,
      colors: getColorPalette(),
      transitionSpeed: Math.max(30, 60 - volatility / 3) // Higher volatility = faster transitions
    }));
  }, [marketSentiment, volatility]);

  // Animate the gradient positions
  useEffect(() => {
    const animateGradient = () => {
      setGradientState(prevState => {
        // Move each position slightly for subtle animation
        const newPositions = prevState.positions.map(pos => 
          (pos + 0.05) % 100 // Cycle through 0-100%
        );
        return { ...prevState, positions: newPositions };
      });
    };
    
    // Set up animation interval
    const intervalId = setInterval(animateGradient, 100); // Update every 100ms for smooth transition
    
    return () => clearInterval(intervalId);
  }, []);

  // Construct gradient CSS
  const backgroundStyle = {
    background: `
      radial-gradient(
        circle at ${gradientState.positions[0]}% ${gradientState.positions[1]}%, 
        ${gradientState.colors[0]} 0%, 
        ${gradientState.colors[1]} 45%, 
        ${gradientState.colors[2]} 100%
      )
    `,
    transition: `background ${gradientState.transitionSpeed}s ease-in-out`,
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full -z-10 ${className}`}
      style={backgroundStyle}
      aria-hidden="true"
    >
      {/* Semi-transparent overlay with pattern */}
      <div 
        className="absolute inset-0 w-full h-full bg-black bg-opacity-50"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.4) 150%)'
        }}
      />
    </div>
  );
};

export default DynamicBackgroundShift;
