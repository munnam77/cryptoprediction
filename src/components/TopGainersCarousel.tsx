import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3, Zap, Star, ArrowUp, Award, Clock, RefreshCw } from 'lucide-react';
import type { MarketData, TimeFrame } from '../types/binance';
import VolatilityWaveform from './VolatilityWaveform';
import MomentumArrow from './MomentumArrow';
import PriceVelocityTicker from './PriceVelocityTicker';
import VolatilityFireworks from './VolatilityFireworks';

interface TopGainersCarouselProps {
  gainers: MarketData[];
  timeframe: TimeFrame;
  audioPingEnabled: boolean;
  onToggleAudioPing: () => void;
  isHistoricalView?: boolean;
  historicalTimestamp?: number;
}

/**
 * TopGainersCarousel Component
 * Displays a carousel of top gaining trading pairs
 */
const TopGainersCarousel: React.FC<TopGainersCarouselProps> = ({
  gainers,
  timeframe,
  audioPingEnabled,
  onToggleAudioPing,
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
  
  // Auto-scroll the carousel every 12 seconds if not in historical view
  useEffect(() => {
    if (isHistoricalView || isTimeframeChanging) return;
    
    const interval = setInterval(() => {
      if (gainers.length > visibleCards) {
        handleNext();
      }
    }, 12000);
    
    return () => clearInterval(interval);
  }, [gainers.length, currentIndex, isHistoricalView, isTimeframeChanging]);
  
  // Handle previous button click
  const handlePrev = () => {
    if (isAnimating || gainers.length <= visibleCards || isTimeframeChanging) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, gainers.length - visibleCards) : prev - 1));
    
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };
  
  // Handle next button click
  const handleNext = () => {
    if (isAnimating || gainers.length <= visibleCards || isTimeframeChanging) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev >= gainers.length - visibleCards ? 0 : prev + 1));
    
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };
  
  // Format price based on value
  const formatPrice = (price: number): string => {
    if (price < 0.001) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(0)}`;
  };
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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
  
  // Get background gradient based on performance
  const getBackgroundGradient = (data: MarketData) => {
    if (data.priceChangePercent > 15) return 'bg-gradient-to-br from-green-900/80 to-gray-900';
    if (data.priceChangePercent > 5) return 'bg-gradient-to-br from-green-800/60 to-gray-900';
    if (data.priceChangePercent < -15) return 'bg-gradient-to-br from-red-900/80 to-gray-900';
    if (data.priceChangePercent < -5) return 'bg-gradient-to-br from-red-800/60 to-gray-900';
    if (data.volatility && data.volatility > 80) return 'bg-gradient-to-br from-orange-900/60 to-gray-900';
    return 'bg-gradient-to-br from-gray-800/80 to-gray-900';
  };
  
  // Get border color based on volatility and price change
  const getBorderColor = (data: MarketData) => {
    const volatility = data.volatility || 0;
    if (volatility > 80) return 'border-orange-500';
    if (volatility > 60) return 'border-yellow-500';
    if (data.priceChangePercent > 10) return 'border-green-500';
    if (data.priceChangePercent < -10) return 'border-red-500';
    return 'border-gray-700';
  };
  
  // Get icon based on performance
  const getIcon = (data: MarketData) => {
    if (data.priceChangePercent > 10) {
      return <ArrowUp size={16} className="text-green-400" />;
    }
    if (data.priceChangePercent < -10) {
      return <TrendingUp size={16} className="text-red-400 transform rotate-180" />;
    }
    if (data.volatility && data.volatility > 80) {
      return <Zap size={16} className="text-yellow-400" />;
    }
    return <Award size={16} className="text-indigo-400" />;
  };
  
  // Get timeframe description
  const getTimeframeDescription = (): string => {
    switch (timeframe) {
      case '15m': return 'Short-term scalping';
      case '30m': return 'Quick trades';
      case '1h': return 'Hourly trends';
      case '4h': return 'Medium-term swings';
      case '1d': return 'Daily movements';
      default: return '';
    }
  };
  
  // Render each gainer card
  const renderGainerCard = (data: MarketData, index: number) => {
    if (!data) return null;
    
    const { symbol } = data;
    const baseAsset = symbol.replace('USDT', '');
    const isHovered = hoveredCard === symbol;
    
    // Calculate rank badge
    const getRankBadge = () => {
      if (index === 0) return 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-yellow-100';
      if (index === 1) return 'bg-gradient-to-r from-gray-500 to-gray-400 text-gray-100';
      if (index === 2) return 'bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100';
      return 'bg-gradient-to-r from-indigo-700 to-indigo-600 text-indigo-100';
    };
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden ${getBackgroundGradient(data)} border-2 ${getBorderColor(data)} shadow-lg transform transition-all duration-300 ease-in-out ${isHovered ? 'scale-105 shadow-xl z-10' : ''}`}
        style={{ 
          width: '130px', 
          height: '130px',
          margin: '0 8px',
          transition: 'all 0.3s ease-in-out'
        }}
        onMouseEnter={() => setHoveredCard(symbol)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Rank Badge */}
        <div className={`absolute top-2 right-2 ${getRankBadge()} text-xs px-1.5 py-0.5 rounded-sm flex items-center`}>
          <span>#{index + 1}</span>
        </div>
        
        {/* Coin Name and Icon */}
        <div className="absolute top-2 left-2 flex items-center">
          {getIcon(data)}
          <span className="ml-1 text-sm font-bold text-white">{baseAsset}</span>
        </div>
        
        {/* Price */}
        <div className="absolute top-10 left-2 right-2 text-center">
          <div className="text-lg font-bold text-white">{formatPrice(data.price)}</div>
        </div>
        
        {/* Price Change */}
        <div className="absolute top-[70px] left-2 right-2 text-center">
          <div className={`text-sm font-medium ${getColorClass(data.priceChangePercent)}`}>
            {formatPercent(data.priceChangePercent)}
          </div>
        </div>
        
        {/* Volume Change */}
        <div className="absolute top-[90px] left-2 right-2 text-center">
          <div className="text-xs text-gray-400">
            Vol: <span className={getColorClass(data.volumeChangePercent)}>
              {formatPercent(data.volumeChangePercent)}
            </span>
          </div>
        </div>
        
        {/* Timeframe */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="px-2 py-0.5 rounded-full bg-indigo-900/60 text-xs text-indigo-200">
            {timeframe} Top
          </div>
        </div>
        
        {/* Historical View Indicator */}
        {isHistoricalView && (
          <div 
            className="absolute top-2 right-2 bg-purple-900/80 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center"
            title={`Historical data from ${new Date(historicalTimestamp).toLocaleString()}`}
          >
            <Clock size={12} className="mr-1" />
            <span>Historical</span>
          </div>
        )}
        
        {/* Volatility Waveform for high volatility coins */}
        {data.volatility && data.volatility > 70 && (
          <VolatilityWaveform 
            volatilityHistory={Array(10).fill(0).map((_, i) => {
              const base = data.volatility || 50;
              return base + (Math.random() * 20 - 10);
            })}
            className="absolute bottom-0 left-0 right-0 h-8"
          />
        )}
        
        {/* Volatility Fireworks for extremely volatile coins */}
        {data.volatility && data.volatility > 85 && (
          <VolatilityFireworks 
            volatility={data.volatility}
            className="absolute inset-0 z-20"
          />
        )}
        
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
            <RefreshCw size={24} className="text-orange-400 animate-spin mb-2" />
            <div className="text-sm text-white">Loading {timeframe} top gainers...</div>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      {gainers.length > visibleCards && !isTimeframeChanging && (
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
          {gainers.length > 0 ? (
            gainers.map((gainer, index) => (
              <div key={gainer.symbol} className="flex-shrink-0">
                {renderGainerCard(gainer, index)}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-10 w-full">
              {isTimeframeChanging ? 
                "Loading top gainers..." : 
                `No top gainers available for ${timeframe} timeframe`}
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination Dots */}
      {gainers.length > visibleCards && !isTimeframeChanging && (
        <div className="flex justify-center mt-2">
          {Array.from({ length: Math.ceil(gainers.length / visibleCards) }).map((_, index) => (
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
      
      {/* Audio Toggle */}
      <div className="absolute bottom-0 right-0 mb-2 mr-2">
        <button
          onClick={onToggleAudioPing}
          className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 flex items-center ${
            audioPingEnabled ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full mr-1 ${audioPingEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          <span>{audioPingEnabled ? 'Audio On' : 'Audio Off'}</span>
        </button>
      </div>
      
      {/* Timeframe indicator */}
      <div className="absolute top-2 left-2 bg-orange-900/60 text-white text-xs px-2 py-1 rounded-sm">
        {timeframe}
      </div>
    </div>
  );
};

export default TopGainersCarousel;
