import React from 'react';
import { Flame } from 'lucide-react';

interface ScalpersStreakCounterProps {
  consecutiveWins: number;
  consecutiveLosses: number;
  totalTrades: number;
  className?: string;
}

/**
 * ScalpersStreakCounter Component
 * Counter showing consecutive winning/losing trades
 */
const ScalpersStreakCounter: React.FC<ScalpersStreakCounterProps> = ({
  consecutiveWins,
  consecutiveLosses,
  totalTrades,
  className = ''
}) => {
  // Calculate win rate
  const winRate = totalTrades > 0 
    ? ((totalTrades - consecutiveLosses) / totalTrades) * 100 
    : 0;
  
  // Determine if on a streak
  const isWinStreak = consecutiveWins > 0 && consecutiveLosses === 0;
  const isLossStreak = consecutiveLosses > 0 && consecutiveWins === 0;
  
  // Get streak text
  const getStreakText = () => {
    if (isWinStreak) return `${consecutiveWins}W`;
    if (isLossStreak) return `${consecutiveLosses}L`;
    return 'No streak';
  };
  
  // Get color based on streak
  const getColor = () => {
    if (isWinStreak) return 'text-green-500 dark:text-green-400';
    if (isLossStreak) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };
  
  // Get flame animation based on streak length
  const getFlameAnimation = () => {
    if (isWinStreak && consecutiveWins >= 3) return 'animate-pulse';
    if (isLossStreak && consecutiveLosses >= 3) return 'animate-pulse';
    return '';
  };
  
  // Get tooltip text
  const getTooltip = () => {
    let tooltip = `${totalTrades} total trades, ${winRate.toFixed(1)}% win rate`;
    
    if (isWinStreak) {
      tooltip += `, ${consecutiveWins} consecutive wins`;
    } else if (isLossStreak) {
      tooltip += `, ${consecutiveLosses} consecutive losses`;
    }
    
    return tooltip;
  };
  
  return (
    <div 
      className={`flex items-center ${className}`}
      title={getTooltip()}
    >
      {/* Streak flame icon (only show for streaks of 3 or more) */}
      {((isWinStreak && consecutiveWins >= 3) || (isLossStreak && consecutiveLosses >= 3)) && (
        <Flame className={`w-4 h-4 mr-1 ${getColor()} ${getFlameAnimation()}`} />
      )}
      
      {/* Streak counter */}
      <div className={`text-sm font-medium ${getColor()}`}>
        {getStreakText()}
      </div>
      
      {/* Win rate (small) */}
      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
        {winRate.toFixed(0)}%
      </div>
    </div>
  );
};

export default ScalpersStreakCounter;
