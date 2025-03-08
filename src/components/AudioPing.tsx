import React, { useEffect, useState, useRef } from 'react';

type AudioPingProps = {
  active: boolean;
  type: 'gain' | 'loss';
  volume?: number; // 0-1 range for volume
  size?: number;
  disabled?: boolean;
  className?: string;
  onComplete?: () => void;
};

/**
 * Audio Ping - Optional chime/beep with visual ripple effect
 * Provides audio and visual feedback for significant price movements
 */
const AudioPing: React.FC<AudioPingProps> = ({
  active,
  type,
  volume = 0.5,
  size = 40,
  disabled = false,
  className = '',
  onComplete
}) => {
  const [animating, setAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined' && !disabled) {
      const gainSound = new Audio('/sounds/gain-chime.mp3');
      const lossSound = new Audio('/sounds/loss-beep.mp3');
      
      gainSound.volume = volume;
      lossSound.volume = volume;
      
      audioRef.current = type === 'gain' ? gainSound : lossSound;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [type, volume, disabled]);
  
  // Handle sound playing and animation
  useEffect(() => {
    if (active && !disabled) {
      setAnimating(true);
      
      // Play sound if enabled
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.error('Audio play error:', err));
      }
      
      // Animation duration
      const timer = setTimeout(() => {
        setAnimating(false);
        if (onComplete) onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [active, disabled, onComplete]);
  
  // Determine colors based on type
  const colors = {
    gain: {
      ring: 'bg-green-500',
      icon: 'text-green-400',
      gradient: 'from-green-600/80 to-green-600/0'
    },
    loss: {
      ring: 'bg-red-500',
      icon: 'text-red-400',
      gradient: 'from-red-600/80 to-red-600/0'
    }
  };
  
  // Render toggle button when disabled is false
  const renderToggleButton = () => (
    <button
      className={`absolute top-1 right-1 rounded-full bg-gray-800 p-1
        hover:bg-gray-700 transition-colors duration-200 z-10`}
      onClick={(e) => {
        e.stopPropagation();
        // This would normally connect to a state manager to toggle audio globally
        console.log('Audio toggle clicked');
      }}
      title={disabled ? 'Enable audio notifications' : 'Disable audio notifications'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-3 h-3 text-gray-400"
      >
        {disabled ? (
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        ) : (
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM1.092 3.003a.75.75 0 00-.511 1.318l16.5 15.75a.75.75 0 101.02-1.101l-16.5-15.75a.75.75 0 00-.51-.216zM22.25 12c0-1.027-.164-2.03-.483-3.003a.75.75 0 00-1.442.423c.271.828.412 1.698.412 2.58 0 1.89-.633 3.77-1.762 5.167a.75.75 0 101.153.963 11.235 11.235 0 002.122-6.13z" />
        )}
      </svg>
    </button>
  );
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Toggle button */}
      {renderToggleButton()}
      
      {/* Center icon */}
      <div 
        className={`absolute inset-0 flex items-center justify-center
          ${colors[type].icon} ${animating ? 'animate-pulse' : 'opacity-50'}`}
        style={{ animationDuration: '0.5s' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          {type === 'gain' ? (
            <path d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 5.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />
          ) : (
            <path d="M16.5 3.75a.75.75 0 00-1.5 0v10.5h-10.5a.75.75 0 000 1.5h10.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5V3.75z" />
          )}
        </svg>
      </div>
      
      {/* Ripple effects */}
      {animating && (
        <>
          {/* First ripple (slower) */}
          <div 
            className={`absolute inset-0 rounded-full 
              bg-gradient-radial ${colors[type].gradient} animate-ping`}
            style={{ 
              animationDuration: '1.5s',
              animationIterationCount: '2'
            }}
          />
          
          {/* Second ripple (faster) */}
          <div 
            className={`absolute inset-2 rounded-full
              bg-gradient-radial ${colors[type].gradient} animate-ping`}
            style={{ 
              animationDuration: '1s',
              animationIterationCount: '3',
              animationDelay: '0.2s'
            }}
          />
          
          {/* Center pulse */}
          <div 
            className={`absolute inset-1/3 rounded-full ${colors[type].ring} animate-pulse`}
            style={{ animationDuration: '0.7s' }}
          />
        </>
      )}
    </div>
  );
};

export default AudioPing;
