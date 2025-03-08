import React from 'react';

type MicroAchievementBadgeProps = {
  achieved: boolean;
  type: 'spotted' | 'correct' | 'streak';
  streak?: number;
  size?: number;
  className?: string;
};

/**
 * Micro Achievement Badge - Bronze badge for user picks
 * Indicates when a user correctly identified a successful coin
 */
const MicroAchievementBadge: React.FC<MicroAchievementBadgeProps> = ({
  achieved,
  type,
  streak = 0,
  size = 24,
  className = '',
}) => {
  if (!achieved) return null;
  
  // Badge types and their tooltips
  const badgeConfig = {
    spotted: {
      tooltip: 'You added this to your watchlist!',
      color: 'from-amber-700 to-amber-500',
      borderColor: 'border-amber-800',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-3 h-3"
        >
          <path 
            d="M12 15a3 3 0 100-6 3 3 0 000 6z" 
          />
          <path 
            fillRule="evenodd" 
            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" 
            clipRule="evenodd" 
          />
        </svg>
      )
    },
    correct: {
      tooltip: 'Your prediction was right!',
      color: 'from-amber-600 to-amber-400',
      borderColor: 'border-amber-700',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-3 h-3"
        >
          <path 
            fillRule="evenodd" 
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
            clipRule="evenodd" 
          />
        </svg>
      )
    },
    streak: {
      tooltip: `${streak} correct predictions in a row!`,
      color: 'from-amber-500 to-amber-300',
      borderColor: 'border-amber-600',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-3 h-3"
        >
          <path 
            fillRule="evenodd" 
            d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" 
            clipRule="evenodd" 
          />
        </svg>
      )
    }
  };
  
  const { tooltip, color, borderColor, icon } = badgeConfig[type];
  
  // Determine animation class based on type
  const animationClass = 
    type === 'streak' && streak >= 3 ? 'animate-glow-pulse' : 
    type === 'correct' ? 'animate-badge-shine' : '';
  
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full 
        bg-gradient-to-b ${color} ${borderColor} border
        shadow-inner overflow-hidden ${animationClass} ${className}`}
      style={{ 
        width: size, 
        height: size, 
        filter: 'drop-shadow(0 0 1px rgba(217, 119, 6, 0.5))'
      }}
      title={tooltip}
    >
      {/* Icon */}
      <div className="text-amber-950">
        {icon}
      </div>
      
      {/* Number indicator for streak */}
      {type === 'streak' && streak > 0 && (
        <div 
          className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 
            rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold
            border border-amber-600"
        >
          {streak}
        </div>
      )}
    </div>
  );
};

export default MicroAchievementBadge;
