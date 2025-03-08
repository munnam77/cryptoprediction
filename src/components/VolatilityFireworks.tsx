import React, { useEffect, useState } from 'react';

interface VolatilityFireworksProps {
  volatility: number; // 0-100
  isActive?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  opacity: number;
  life: number;
}

/**
 * VolatilityFireworks Component
 * Animated fireworks effect for extreme volatility events
 */
const VolatilityFireworks: React.FC<VolatilityFireworksProps> = ({
  volatility,
  isActive = true,
  className = ''
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Ensure volatility is between 0-100
  const validVolatility = Math.min(Math.max(volatility, 0), 100);
  
  // Get tooltip text
  const getTooltip = () => {
    let description = '';
    
    if (validVolatility >= 80) description = 'Extreme';
    else if (validVolatility >= 60) description = 'Very high';
    else if (validVolatility >= 40) description = 'High';
    else if (validVolatility >= 20) description = 'Moderate';
    else description = 'Low';
    
    return `${description} volatility: ${validVolatility}%`;
  };
  
  // Generate random color based on volatility
  const getRandomColor = () => {
    if (validVolatility >= 80) {
      // Extreme volatility - red, orange, yellow
      const colors = ['#ef4444', '#f97316', '#facc15'];
      return colors[Math.floor(Math.random() * colors.length)];
    } else if (validVolatility >= 40) {
      // High volatility - blue, purple
      const colors = ['#3b82f6', '#8b5cf6', '#a855f7'];
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      // Low volatility - green, teal
      const colors = ['#10b981', '#14b8a6', '#06b6d4'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  };
  
  // Create fireworks animation
  useEffect(() => {
    if (!isActive || validVolatility < 20) {
      setParticles([]);
      return;
    }
    
    // Determine explosion frequency based on volatility
    const explosionInterval = validVolatility >= 80 ? 1000 : 
                              validVolatility >= 60 ? 2000 : 
                              validVolatility >= 40 ? 3000 : 4000;
    
    // Determine particle count based on volatility
    const particleCount = Math.floor(validVolatility / 10) + 5;
    
    // Create explosion
    const createExplosion = () => {
      // Random position within container
      const centerX = Math.random() * 100;
      const centerY = Math.random() * 100;
      
      // Create particles
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        // Random angle
        const angle = Math.random() * Math.PI * 2;
        
        // Random velocity (faster for higher volatility)
        const speed = (Math.random() * 2 + 1) * (validVolatility / 50);
        
        newParticles.push({
          id: Date.now() + i,
          x: centerX,
          y: centerY,
          size: Math.random() * 4 + 2,
          color: getRandomColor(),
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          },
          opacity: 1,
          life: 100
        });
      }
      
      setParticles(prev => [...prev, ...newParticles]);
    };
    
    // Initial explosion
    createExplosion();
    
    // Set interval for repeated explosions
    const intervalId = setInterval(createExplosion, explosionInterval);
    
    // Animation frame for updating particles
    let animationFrameId: number;
    
    const updateParticles = () => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            velocity: {
              x: particle.velocity.x * 0.98,
              y: particle.velocity.y * 0.98 + 0.01 // Add gravity
            },
            opacity: particle.opacity - 0.01,
            life: particle.life - 1
          }))
          .filter(particle => particle.life > 0 && particle.opacity > 0)
      );
      
      animationFrameId = requestAnimationFrame(updateParticles);
    };
    
    animationFrameId = requestAnimationFrame(updateParticles);
    
    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, validVolatility]);
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: '100px', height: '60px' }}
      title={getTooltip()}
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      
      {/* Volatility indicator when no particles */}
      {particles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {validVolatility}% vol
          </span>
        </div>
      )}
    </div>
  );
};

export default VolatilityFireworks;
