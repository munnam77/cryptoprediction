import React, { useEffect, useState } from 'react';

interface DynamicBackgroundShiftProps {
  marketSentiment: number; // 0-100
  volatility: number; // 0-100
}

const DynamicBackgroundShift: React.FC<DynamicBackgroundShiftProps> = ({
  marketSentiment,
  volatility
}) => {
  const [gradientColors, setGradientColors] = useState(['#0f172a', '#1e293b']);

  useEffect(() => {
    // Define color schemes based on market sentiment
    const getColorScheme = () => {
      if (marketSentiment >= 75) {
        return ['#064e3b', '#065f46']; // Strong bullish (green)
      } else if (marketSentiment >= 60) {
        return ['#0d9488', '#0f766e']; // Moderately bullish (teal)
      } else if (marketSentiment >= 40) {
        return ['#1e293b', '#0f172a']; // Neutral (slate)
      } else if (marketSentiment >= 25) {
        return ['#7f1d1d', '#991b1b']; // Moderately bearish (red)
      } else {
        return ['#881337', '#9f1239']; // Strong bearish (rose)
      }
    };

    // Add volatility-based glow effect
    const addVolatilityEffect = (colors: string[]) => {
      const glowIntensity = Math.min(volatility / 100 * 0.4, 0.4); // Max 40% opacity for glow
      return colors.map(color => color + Math.round(glowIntensity * 255).toString(16).padStart(2, '0'));
    };

    const baseColors = getColorScheme();
    const finalColors = addVolatilityEffect(baseColors);
    setGradientColors(finalColors);
  }, [marketSentiment, volatility]);

  return (
    <div 
      className="fixed inset-0 transition-colors duration-1000 ease-in-out -z-10"
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
      }}
    >
      {/* Subtle grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Volatility-based animated glow */}
      {volatility > 50 && (
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${gradientColors[0]}66 0%, transparent 70%)`,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
};

export default DynamicBackgroundShift;
