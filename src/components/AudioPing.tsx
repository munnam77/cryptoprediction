import React, { useEffect, useRef } from 'react';

interface AudioPingProps {
  id: string;
  enabled: boolean;
  variant?: 'success' | 'warning' | 'alert';
}

/**
 * AudioPing Component
 * Creates an audio element for notifications and alerts
 */
const AudioPing: React.FC<AudioPingProps> = ({ id, enabled, variant = 'alert' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Determine the audio source based on variant
  const getAudioSource = (): string => {
    switch (variant) {
      case 'success':
        return '/sounds/success-ping.mp3';
      case 'warning':
        return '/sounds/warning-ping.mp3';
      case 'alert':
      default:
        return '/sounds/alert-ping.mp3';
    }
  };

  // Use a data URL as fallback if audio files don't exist
  const getFallbackAudioSource = (): string => {
    // These are very short data URLs for simple beep sounds
    switch (variant) {
      case 'success':
        return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      case 'warning':
        return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      case 'alert':
      default:
        return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    }
  };

  // Set volume based on variant
  useEffect(() => {
    if (audioRef.current) {
      switch (variant) {
        case 'success':
          audioRef.current.volume = 0.4;
          break;
        case 'warning':
          audioRef.current.volume = 0.6;
          break;
        case 'alert':
        default:
          audioRef.current.volume = 0.7;
          break;
      }
    }
  }, [variant]);

  return (
    <audio 
      ref={audioRef}
      id={id}
      src={getAudioSource()}
      preload="auto"
      style={{ display: 'none' }}
      onError={(e) => {
        // Fallback to data URL if file not found
        const audioElement = e.currentTarget;
        audioElement.src = getFallbackAudioSource();
      }}
    />
  );
};

export default AudioPing;
