import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Star, ArrowUp, Award, Clock, RefreshCw } from 'lucide-react';
import type { MarketData, TimeFrame } from '../types/binance';
import VolatilityWaveform from './VolatilityWaveform';
import MomentumArrow from './MomentumArrow';
import SentimentPulseDot from './SentimentPulseDot';
import LiveTradeSignalBeam from './LiveTradeSignalBeam';
import VolatilityFireworks from './VolatilityFireworks';
import QuickTradeButton from './QuickTradeButton';
import ScalpersStreakCounter from './ScalpersStreakCounter';
import RiskSnapDot from './RiskSnapDot';
import WhaleTailIcon from './WhaleTailIcon';

interface TopPicksCarouselProps {
  gems: MarketData[];
  timeframe: TimeFrame;
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
}

/**
 * TopPicksCarousel Component
 * Displays a carousel of low-cap gem cards with various features
 */
const TopPicksCarousel: React.FC<TopPicksCarouselProps> = ({ 
  gems, 
  timeframe,
  isHistoricalView = false,
  historicalTimestamp = Date.now()
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isTimeframeChanging, setIsTimeframeChanging] = useState(false);
  const prevTimeframeRef = useRef<TimeFrame>(timeframe);
  const carouselRef = useRef<HTMLDivElement>(null);
  const visibleCards = 3; // Number of cards visible at once
  
  // Handle timeframe changes with animation
  useEffect(() => {
    if (prevTimeframeRef.current !== timeframe) {
      // Timeframe has changed
      setIsTimeframeChanging(true);
      setCurrentIndex(0); // Reset to first card
      
      // Animate the transition
      setTimeout(() => {
        setIsTimeframeChanging(false);
        prevTimeframeRef.current = timeframe;
      }, 500);
    }
  }, [timeframe]);
  
  // Auto-scroll the carousel every 10 seconds if not in historical view
  useEffect(() => {
    if (isHistoricalView || isTimeframeChanging) return;
    
    const interval = setInterval(() => {
      if (gems.length > visibleCards) {
        handleNext();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [gems.length, currentIndex, isHistoricalView, isTimeframeChanging]);
  
  // Handle previous button click
  const handlePrev = () => {
    if (isAnimating || gems.length <= visibleCards || isTimeframeChanging) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, gems.length - visibleCards) : prev - 1));
    
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };
  
  // Handle next button click
  const handleNext = () => {
    if (isAnimating || gems.length <= visibleCards || isTimeframeChanging) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev >= gems.length - visibleCards ? 0 : prev + 1));
    
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };
  
  // Format price based on value
  const formatPrice = (price: number): string => {
    if (price < 0.001) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(0)}`;
  };
  
  // Get color class based on value
  const getColorClass = (value: number): string => {
    if (value > 10) return 'text-green-400';
    if (value > 5) return 'text-green-300';
    if (value > 0) return 'text-green-200';
    if (value < -10) return 'text-red-400';
    if (value < -5) return 'text-red-300';
    return 'text-red-200';
  };
  
  // Get features to show for each card
  const getFeaturesToShow = (index: number, data: MarketData): JSX.Element[] => {
    const features: JSX.Element[] = [];
    
    // Risk snap dot for risk visualization
    features.push(
      <RiskSnapDot 
        key="risk"
        riskLevel={data.riskScore && data.riskScore > 75 ? 'high' : 
                 data.riskScore && data.riskScore > 50 ? 'medium' : 'low'}
        className="absolute bottom-8 left-2 w-3 h-3"
      />
    );
    
    // Whale tail icon if there's recent whale activity
    if (data.whaleActivity && 
        ((data.whaleActivity.buyPressure && data.whaleActivity.buyPressure > 70) || 
        (data.whaleActivity.sellPressure && data.whaleActivity.sellPressure > 70))) {
      features.push(
        <WhaleTailIcon 
          key="whale"
          whaleActivity={data.whaleActivity && data.whaleActivity.buyPressure && data.whaleActivity.sellPressure && 
                data.whaleActivity.buyPressure > data.whaleActivity.sellPressure ? 'buying' : 'selling'}
          transactionSize={data.whaleActivity && data.whaleActivity.lastTransaction?.amount || 0}
          className="absolute top-8 right-2 w-6 h-6"
        />
      );
    }

    // Add historical icon if in historical view
    if (isHistoricalView) {
      features.push(
        <div 
          key="historical"
          className="absolute top-2 right-2 bg-purple-900/80 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center"
          title={`Historical data from ${new Date(historicalTimestamp).toLocaleString()}`}
        >
          <Clock size={12} className="mr-1" />
          <span>Historical</span>
        </div>
      );
    }
    
    // Add volatility waveform for high volatility coins
    if (index % 3 === 0 || (data.volatility && data.volatility > 70)) {
      // Create a mock volatility history array from the single volatility value
      const volatilityHistory = Array(10).fill(0).map((_, i) => {
        const base = data.volatility || 50;
        return base + (Math.random() * 20 - 10); // Add some random variation
      });
      
      features.push(
        <VolatilityWaveform 
          key="volatility"
          volatilityHistory={volatilityHistory}
          className="absolute bottom-0 left-0 right-0 h-8"
        />
      );
    }
    
    // Add momentum arrow for coins with strong momentum
    if (index % 3 === 1 || (data.momentum && Math.abs(data.momentum) > 60)) {
      features.push(
        <MomentumArrow 
          key="momentum"
          momentum={data.momentum || 0}
          timeframe={timeframe}
          className="absolute top-2 right-2 w-6 h-6"
        />
      );
    }
    
    // Add sentiment pulse dot for coins with high sentiment
    if (index % 3 === 2 || (data.sentiment && data.sentiment > 70)) {
      features.push(
        <SentimentPulseDot 
          key="sentiment"
          sentiment={data.sentiment || 50}
          source="social" 
          className="absolute top-2 left-2 w-4 h-4"
        />
      );
    }
    
    // Add live trade signal beam for coins with strong signals
    if (data.signalStrength && data.signalStrength > 70) {
      features.push(
        <LiveTradeSignalBeam 
          key="signal"
          signal={data.signalDirection || 'neutral'}
          strength={data.signalStrength || 0}
          source="algorithm"
          className="absolute inset-0 z-10"
        />
      );
    }
    
    // Add volatility fireworks for extremely volatile coins
    if (data.volatility && data.volatility > 85) {
      features.push(
        <VolatilityFireworks 
          key="fireworks"
          volatility={data.volatility}
          className="absolute inset-0 z-20"
        />
      );
    }
    
    // Add quick trade button if not in historical view
    if (!isHistoricalView) {
      features.push(
        <QuickTradeButton 
          key="trade"
          symbol={data.symbol}
          currentPrice={data.price}
          className="absolute bottom-2 right-2"
        />
      );
    }
    
    // Add streak counter for coins with consecutive gains
    if (data.consecutiveGains && data.consecutiveGains > 2) {
      features.push(
        <ScalpersStreakCounter 
          key="streak"
          consecutiveWins={data.priceChangePercent > 0 ? data.consecutiveGains : 0}
          consecutiveLosses={data.priceChangePercent <= 0 ? data.consecutiveGains : 0}
          totalTrades={data.consecutiveGains + Math.floor(Math.random() * 10)}
          className="absolute bottom-2 left-2"
        />
      );
    }
    
    return features;
  };
  
  // Render each gem card
  const renderGemCard = (data: MarketData, index: number) => {
    if (!data) return null;
    
    const { symbol } = data;
    const baseAsset = symbol.replace('USDT', '');
    const isHovered = hoveredCard === symbol;
    
    // Calculate market cap category
    const marketCapCategory = () => {
      const cap = data.marketCap || 0;
      if (cap < 10000000) return 'Micro Cap';
      if (cap < 100000000) return 'Small Cap';
      if (cap < 500000000) return 'Mid Cap';
      return 'Large Cap';
    };
    
    // Format gem score
    const formatScore = (score: number | undefined): string => {
      if (score === undefined) return 'N/A';
      return score.toFixed(0);
    };
    
    // Get border color based on volatility
    const getBorderColor = () => {
      const volatility = data.volatility || 0;
      if (volatility > 80) return 'border-orange-500';
      if (volatility > 60) return 'border-yellow-500';
      if (data.priceChangePercent > 10) return 'border-green-500';
      if (data.priceChangePercent < -10) return 'border-red-500';
      return 'border-gray-700';
    };
    
    // Get background gradient based on performance
    const getBackgroundGradient = () => {
      if (data.priceChangePercent > 15) return 'bg-gradient-to-br from-green-900/80 to-gray-900';
      if (data.priceChangePercent > 5) return 'bg-gradient-to-br from-green-800/60 to-gray-900';
      if (data.priceChangePercent < -15) return 'bg-gradient-to-br from-red-900/80 to-gray-900';
      if (data.priceChangePercent < -5) return 'bg-gradient-to-br from-red-800/60 to-gray-900';
      if (data.volatility && data.volatility > 80) return 'bg-gradient-to-br from-orange-900/60 to-gray-900';
      return 'bg-gradient-to-br from-gray-800/80 to-gray-900';
    };
    
    // Get icon based on performance
    const getIcon = () => {
      if (data.priceChangePercent > 10) {
        return <ArrowUp size={16} className="text-green-400" />;
      }
      if (data.priceChangePercent < -10) {
        return <TrendingUp size={16} className="text-red-400 transform rotate-180" />;
      }
      if (data.volatility && data.volatility > 80) {
        return <Zap size={16} className="text-yellow-400" />;
      }
      return <Star size={16} className="text-indigo-400" />;
    };
    
    // Get features for this card
    const features = getFeaturesToShow(index, data);
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden ${getBackgroundGradient()} border-2 ${getBorderColor()} shadow-lg transform transition-all duration-300 ease-in-out ${isHovered ? 'scale-105 shadow-xl z-10' : ''}`}
        style={{ 
          width: '130px', 
          height: '130px',
          margin: '0 8px',
          transition: 'all 0.3s ease-in-out'
        }}
        onMouseEnter={() => setHoveredCard(symbol)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Coin Name and Icon */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          <div className="flex items-center">
            {getIcon()}
            <span className="ml-1 text-sm font-bold text-white">{baseAsset}</span>
          </div>
          <div className="text-xs text-gray-400">
            {marketCapCategory()}
          </div>
        </div>
        
        {/* Price */}
        <div className="absolute top-10 left-2 right-2 text-center">
          <div className="text-lg font-bold text-white">{formatPrice(data.price)}</div>
        </div>
        
        {/* Price Change */}
        <div className="absolute top-[70px] left-2 right-2 text-center">
          <div className={`text-sm font-medium ${getColorClass(data.priceChangePercent)}`}>
            {data.priceChangePercent > 0 ? '+' : ''}{data.priceChangePercent.toFixed(2)}%
          </div>
        </div>
        
        {/* Volume Change */}
        <div className="absolute top-[90px] left-2 right-2 text-center">
          <div className="text-xs text-gray-400">
            Vol: <span className={getColorClass(data.volumeChangePercent)}>
              {data.volumeChangePercent > 0 ? '+' : ''}{data.volumeChangePercent.toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Gem Score */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="px-2 py-0.5 rounded-full bg-indigo-900/60 text-xs text-indigo-200">
            Score: {formatScore(data.gemScore)}
          </div>
        </div>
        
        {/* Render all features */}
        {features}
        
        {/* Hover overlay with additional info */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center p-2 animate-fade-in">
            <div className="text-xs text-white mb-1">
              <span className="font-medium">Volatility:</span> {data.volatility?.toFixed(0) || 'N/A'}
            </div>
            {data.pumpProbability && (
              <div className="text-xs text-white mb-1">
                <span className="font-medium">Pump Odds:</span> {data.pumpProbability.toFixed(0)}%
              </div>
            )}
            {data.profitTarget && (
              <div className="text-xs text-white">
                <span className="font-medium">Target:</span> {data.profitTarget > 0 ? '+' : ''}{data.profitTarget.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`relative transition-opacity duration-500 ${isTimeframeChanging ? 'opacity-50' : 'opacity-100'}`}>
      {/* Timeframe changing indicator */}
      {isTimeframeChanging && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/30 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center">
            <RefreshCw size={24} className="text-indigo-400 animate-spin mb-2" />
            <div className="text-sm text-white">Loading {timeframe} top picks...</div>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      {gems.length > visibleCards && !isTimeframeChanging && (
        <>
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-gray-800/80 hover:bg-gray-700/80 rounded-full p-1 text-white shadow-lg transition-colors duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-gray-800/80 hover:bg-gray-700/80 rounded-full p-1 text-white shadow-lg transition-colors duration-200"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
      
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="flex justify-center items-center py-2 overflow-hidden"
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (130 + 16)}px)`,
          }}
        >
          {gems.length > 0 ? (
            gems.map((gem, index) => (
              <div key={gem.symbol} className="flex-shrink-0">
                {renderGemCard(gem, index)}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10 w-full">
              {isTimeframeChanging ? 
                "Loading top picks..." : 
                `No low-cap gems available for ${timeframe} timeframe`}
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination Dots */}
      {gems.length > visibleCards && !isTimeframeChanging && (
        <div className="flex justify-center mt-2">
          {Array.from({ length: Math.ceil(gems.length / visibleCards) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCurrentIndex(index * visibleCards);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className={`w-2 h-2 rounded-full mx-1 transition-colors duration-200 ${
                Math.floor(currentIndex / visibleCards) === index 
                  ? 'bg-indigo-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Timeframe indicator */}
      <div className="absolute top-2 left-2 bg-indigo-900/60 text-white text-xs px-2 py-1 rounded-sm">
        {timeframe}
      </div>
    </div>
  );
};

export default TopPicksCarousel;
