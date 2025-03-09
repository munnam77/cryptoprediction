import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { MarketData } from '../services/BinanceService';
import VolatilityVolumeCorrelationDot from './VolatilityVolumeCorrelationDot';
import HistoricalVolatilityBadge from './HistoricalVolatilityBadge';
import FlashSentimentSpike from './FlashSentimentSpike';
import MicroAchievementBadge from './MicroAchievementBadge';
import TimeframeVolatilityRank from './TimeframeVolatilityRank';
import LiquidityDepthGauge from './LiquidityDepthGauge';
import VolumeDecayWarning from './VolumeDecayWarning';
import PumpCycleTag from './PumpCycleTag';
import AudioPing from './AudioPing';

interface TopGainersCarouselProps {
  gainers: MarketData[];
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  audioPingEnabled: boolean;
  onToggleAudioPing: () => void;
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
}

/**
 * Carousel of top performing coins with special features as described in context.md
 * - Features displayed: 
 * 1. Volume Change % Trendline
 * 2. Liquidity Depth Gauge
 * 3. Volatility vs. Volume Correlation Dot 
 * 4. Historical Volatility Badge
 * 5. Flash Sentiment Spike
 * 6. Micro Achievement Badge
 * 7. Timeframe Volatility Rank
 * 8. Audio Ping
 * 9. Volume Decay Warning
 * 10. Pump Cycle Tag
 */
const TopGainersCarousel: React.FC<TopGainersCarouselProps> = ({ 
  gainers, 
  timeframe,
  audioPingEnabled,
  onToggleAudioPing,
  isHistoricalView = false,
  historicalTimestamp = Date.now()
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto-rotate carousel every 8 seconds (only if not in historical view)
  useEffect(() => {
    if (isHistoricalView) return;
    
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % Math.max(1, Math.ceil(gainers.length / 3)));
    }, 8000);
    
    return () => clearInterval(interval);
  }, [gainers.length, isHistoricalView]);

  // Format helpers
  const formatChangePercent = (value: number): string => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number): string => {
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-300';
  };

  // Check if a coin has a new sentiment spike
  const hasSentimentSpike = (coin: MarketData): boolean => {
    return (coin.sentimentSpike !== undefined && coin.sentimentSpike > 50);
  };

  // Check if volume is decaying
  const hasVolumeDecay = (coin: MarketData): boolean => {
    return (coin.volumeDecay !== undefined && coin.volumeDecay > 30);
  };

  // Trigger audio ping for significant gainers (only in live view)
  useEffect(() => {
    if (audioPingEnabled && gainers.length > 0 && !isHistoricalView) {
      const significantGainer = gainers.find(g => g.priceChangePercent > 15);
      if (significantGainer) {
        const audioElement = document.getElementById('gainerPing') as HTMLAudioElement;
        if (audioElement) audioElement.play();
      }
    }
  }, [gainers, audioPingEnabled, isHistoricalView]);

  return (
    <div className="h-full">
      {/* Hidden audio element for pings */}
      <AudioPing id="gainerPing" enabled={audioPingEnabled && !isHistoricalView} variant="success" />
      
      {/* Header with audio toggle and historical indicator */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium flex items-center">
          {timeframe} Top Performers
          {isHistoricalView && (
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-800 rounded-md">
              Historical
            </span>
          )}
        </div>
        
        {/* Only show audio toggle in live mode */}
        {!isHistoricalView && (
          <button 
            onClick={onToggleAudioPing}
            className={`flex items-center px-2 py-1 rounded-full text-xs ${
              audioPingEnabled ? 'bg-green-800 text-green-200' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <span className="mr-1">Audio</span>
            <div className={`w-3 h-3 rounded-full ${audioPingEnabled ? 'bg-green-400' : 'bg-gray-500'}`}></div>
          </button>
        )}
        
        {/* Show timestamp in historical mode */}
        {isHistoricalView && (
          <div className="text-xs text-purple-300 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(historicalTimestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-3">
        {gainers.slice(carouselIndex * 3, carouselIndex * 3 + 3).map((coin, index) => (
          <div 
            key={coin.symbol} 
            className={`relative flex flex-col justify-between rounded-lg p-2 border overflow-hidden ${
              isHistoricalView 
                ? 'bg-gradient-to-b from-purple-900/20 to-gray-900 border-purple-700'
                : `bg-gradient-to-b from-purple-900/20 to-gray-900 border-gray-700 ${
                    coin.priceChangePercent > 20 ? 'border-purple-500 border-opacity-50' : ''
                  }`
            }`}
          >
            {/* Historical corner badge */}
            {isHistoricalView && (
              <div className="absolute -top-1 -right-1 bg-purple-800 px-1 py-0.5 text-[10px] font-medium text-white z-10 rounded-bl">
                Past
              </div>
            )}

            {/* Coin identifiers */}
            <div>
              <div className="font-medium text-sm">
                {coin.baseAsset}/{coin.quoteAsset}
              </div>
              <div className={`text-sm font-bold ${getColorClass(coin.priceChangePercent)}`}>
                {formatChangePercent(coin.priceChangePercent)}
              </div>
            </div>

            {/* Middle section with gauges/indicators */}
            <div className="flex my-2 space-x-1 justify-center">
              {/* Feature 2: Liquidity Depth Gauge */}
              <LiquidityDepthGauge 
                liquidity={coin.liquidity || 50}
                className="w-6 h-12"
              />
              
              {/* Feature 3: Correlation Dot */}
              <VolatilityVolumeCorrelationDot 
                volatility={coin.volatility || 50}
                volumeChange={coin.volumeChangePercent}
                className="w-6 h-12"
              />
            </div>

            {/* Bottom bar with various indicators */}
            <div className="flex items-end justify-between">
              <div className="flex space-x-1">
                {/* Feature 4: Historical Volatility Badge */}
                <HistoricalVolatilityBadge 
                  percentile={coin.volatilityRank !== undefined ? coin.volatilityRank : 50}
                  timeframe={timeframe}
                  className="h-5"
                />
                
                {/* Feature 7: Timeframe Volatility Rank */}
                {coin.volatilityRank !== undefined && coin.volatilityRank < 10 && (
                  <TimeframeVolatilityRank
                    rank={Math.ceil(coin.volatilityRank / 2)}
                    timeframe={timeframe}
                    className="h-5"
                  />
                )}
              </div>
              
              <div>
                {/* Feature 10: Pump Cycle Tag */}
                {coin.pumpProbability !== undefined && coin.pumpProbability > 70 && (
                  <PumpCycleTag 
                    phase="accumulation"
                    probability={coin.pumpProbability}
                  />
                )}
              </div>
            </div>

            {/* Overlays and special indicators - only show some animations in live mode */}
            
            {/* Feature 5: Flash Sentiment Spike */}
            {hasSentimentSpike(coin) && !isHistoricalView && (
              <FlashSentimentSpike 
                level={coin.sentimentSpike || 0}
                threshold={50}
                className="absolute top-0 right-0"
              />
            )}
            
            {/* Feature 6: Micro Achievement Badge */}
            {index === 0 && (
              <MicroAchievementBadge 
                achievement="top_gainer"
                className="absolute top-1 left-1"
              />
            )}
            
            {/* Feature 9: Volume Decay Warning */}
            {hasVolumeDecay(coin) && (
              <VolumeDecayWarning 
                decayLevel={coin.volumeDecay || 0}
                threshold={30}
                className="absolute bottom-1 left-1"
                animate={!isHistoricalView}
              />
            )}
            
            {/* Feature 1: Volume Change % Trendline - as background overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg width="100%" height="100%" className="opacity-20">
                <defs>
                  <linearGradient id={`volumeGradient-${coin.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={coin.volumeChangePercent > 0 ? "#4ade80" : "#f87171"} />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path 
                  d={`M0,${50 - coin.volumeChangePercent / 4} 
                      Q${25},${50 - coin.volumeChangePercent / 2} 
                      ${50},${50 - coin.volumeChangePercent / 3}
                      T${100},${50 - coin.volumeChangePercent / 5}`}
                  stroke={coin.volumeChangePercent > 0 ? "#4ade80" : "#f87171"}
                  strokeWidth="1.5"
                  fill="url(#volumeGradient-${coin.symbol})"
                  strokeDasharray="5,3"
                />
              </svg>
            </div>
            
            {/* Historical mode overlay */}
            {isHistoricalView && (
              <div className="absolute bottom-0 right-0 p-1">
                <Clock className="w-3 h-3 text-purple-300" />
              </div>
            )}
          </div>
        ))}

        {/* Placeholder cards if needed */}
        {gainers.length === 0 && (
          <>
            {[1, 2, 3].map(i => (
              <div 
                key={`placeholder-${i}`} 
                className="bg-gray-800 bg-opacity-30 rounded-lg p-3 border border-gray-700 flex items-center justify-center"
              >
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination dots */}
      {gainers.length > 3 && (
        <div className="flex justify-center mt-3">
          {Array.from({ length: Math.ceil(gainers.length / 3) }).map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full mx-1 ${
                i === carouselIndex ? (isHistoricalView ? 'bg-purple-500' : 'bg-purple-500') : 'bg-gray-700'
              }`}
              onClick={() => setCarouselIndex(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Historical mode info text */}
      {isHistoricalView && (
        <div className="text-center mt-2 text-xs text-purple-300">
          Historical top gainers from {new Date(historicalTimestamp).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default TopGainersCarousel;
