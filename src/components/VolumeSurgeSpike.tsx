import React from 'react';
import { BarChart3 } from 'lucide-react';

interface VolumeSurgeSpikeProps {
  volume: number;
  averageVolume: number;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  className?: string;
}

/**
 * VolumeSurgeSpike Component
 * Animated spike showing sudden volume increase
 */
const VolumeSurgeSpike: React.FC<VolumeSurgeSpikeProps> = ({
  volume,
  averageVolume,
  timeframe,
  className = ''
}) => {
  // Calculate volume increase percentage
  const volumeIncrease = averageVolume > 0 
    ? ((volume - averageVolume) / averageVolume) * 100 
    : 0;
  
  // Determine spike intensity based on volume increase
  const getSpikeIntensity = () => {
    if (volumeIncrease >= 300) return 'high';
    if (volumeIncrease >= 100) return 'medium';
    return 'low';
  };
  
  // Get color based on intensity
  const getColor = () => {
    const intensity = getSpikeIntensity();
    if (intensity === 'high') return 'text-purple-500 dark:text-purple-400';
    if (intensity === 'medium') return 'text-blue-500 dark:text-blue-400';
    return 'text-cyan-500 dark:text-cyan-400';
  };
  
  // Get animation based on intensity
  const getAnimation = () => {
    const intensity = getSpikeIntensity();
    if (intensity === 'high') return 'animate-pulse';
    if (intensity === 'medium') return 'animate-pulse';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    const intensity = getSpikeIntensity();
    let description = '';
    
    if (intensity === 'high') description = 'Massive';
    else if (intensity === 'medium') description = 'Significant';
    else description = 'Moderate';
    
    return `${description} volume surge: +${volumeIncrease.toFixed(0)}% in ${timeframe}`;
  };
  
  // Generate spike bars
  const generateSpikeBars = () => {
    const intensity = getSpikeIntensity();
    const barCount = intensity === 'high' ? 5 : intensity === 'medium' ? 4 : 3;
    
    return Array.from({ length: barCount }).map((_, index) => {
      // Calculate height based on position (middle bars taller)
      let height = 0;
      if (barCount === 5) {
        if (index === 2) height = 100;
        else if (index === 1 || index === 3) height = 80;
        else height = 60;
      } else if (barCount === 4) {
        if (index === 1 || index === 2) height = 90;
        else height = 70;
      } else {
        if (index === 1) height = 90;
        else height = 70;
      }
      
      return (
        <div
          key={index}
          className={`w-1 bg-current rounded-t-sm ${index === Math.floor(barCount / 2) ? getAnimation() : ''}`}
          style={{ height: `${height}%` }}
        />
      );
    });
  };
  
  return (
    <div 
      className={`flex items-end space-x-0.5 ${getColor()} ${className}`}
      style={{ height: '20px' }}
      title={getTooltip()}
    >
      <BarChart3 className="w-4 h-4 mr-1" />
      {generateSpikeBars()}
    </div>
  );
};

export default VolumeSurgeSpike;
