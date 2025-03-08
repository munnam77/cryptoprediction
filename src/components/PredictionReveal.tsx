import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface PredictionRevealProps {
  onRevealComplete?: () => void;
}

function PredictionReveal({ onRevealComplete }: PredictionRevealProps) {
  const [timeUntilReveal, setTimeUntilReveal] = useState<string>('');
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const calculateTimeUntilReveal = () => {
      const now = new Date();
      const jstOffset = 9 * 60; // JST is UTC+9
      const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      const jstMinutes = (utcMinutes + jstOffset) % (24 * 60);
      const targetMinutes = 9 * 60; // 9 AM JST

      let minutesUntil = targetMinutes - jstMinutes;
      if (minutesUntil <= 0) {
        minutesUntil += 24 * 60;
      }

      const hours = Math.floor(minutesUntil / 60);
      const minutes = minutesUntil % 60;
      
      return `${hours}h ${minutes}m`;
    };

    const timer = setInterval(() => {
      setTimeUntilReveal(calculateTimeUntilReveal());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Temporary trigger for demo purposes
  const triggerReveal = () => {
    setIsRevealing(true);
    setTimeout(() => {
      setIsRevealing(false);
      onRevealComplete?.();
    }, 3000);
  };

  if (isRevealing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white animate-pulse">
            Revealing New Predictions
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 text-gray-400">
      <Clock className="w-5 h-5" />
      <span>Next Reveal: {timeUntilReveal}</span>
      {/* Temporary button for demo purposes */}
      <button
        onClick={triggerReveal}
        className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
      >
        Demo Reveal
      </button>
    </div>
  );
}

export default PredictionReveal;