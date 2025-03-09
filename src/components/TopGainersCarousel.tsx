import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3 } from 'lucide-react';
import { TradingPair } from './TradingPairTable';
import PriceVelocityTicker from './PriceVelocityTicker';

interface TopGainersCarouselProps {
  pairs: TradingPair[];
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onSelectPair: (symbol: string) => void;
  className?: string;
}

/**
 * TopGainersCarousel Component
 * Displays a horizontal carousel of top gaining trading pairs
 */
const TopGainersCarousel: React.FC<TopGainersCarouselProps> = ({
  pairs,
  timeframe,
  onSelectPair,
  className = ''
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  
  // Update max scroll value when component mounts or window resizes
  useEffect(() => {
    const updateMaxScroll = () => {
      if (carouselRef.current) {
        const { scrollWidth, clientWidth } = carouselRef.current;
        setMaxScroll(Math.max(0, scrollWidth - clientWidth));
      }
    };
    
    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll);
    
    return () => {
      window.removeEventListener('resize', updateMaxScroll);
    };
  }, [pairs]);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        setScrollPosition(carouselRef.current.scrollLeft);
      }
    };
    
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Scroll left
  const scrollLeft = () => {
    if (carouselRef.current) {
      const newPosition = Math.max(0, scrollPosition - 300);
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };
  
  // Scroll right
  const scrollRight = () => {
    if (carouselRef.current) {
      const newPosition = Math.min(maxScroll, scrollPosition + 300);
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };
  
  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Format volume with appropriate suffix (K, M, B)
  const formatVolume = (volume: number): string => {
    if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `$${(volume / 1_000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };
  
  // Get top gainers
  const topGainers = pairs
    .filter(pair => pair.priceChange24h > 0)
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, 10);
  
  // Get background gradient based on price change
  const getGradient = (priceChange: number): string => {
    if (priceChange > 20) return 'from-green-500/20 to-green-900/5';
    if (priceChange > 10) return 'from-green-600/15 to-green-900/5';
    if (priceChange > 5) return 'from-green-700/10 to-green-900/5';
    return 'from-green-800/5 to-green-900/5';
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center mb-3">
        <TrendingUp size={18} className="text-green-500 mr-2" />
        <h2 className="text-lg font-semibold">Top Gainers</h2>
        <span className="text-xs text-gray-400 ml-2">Based on {timeframe} timeframe</span>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute right-0 top-0 flex space-x-2">
        <button
          onClick={scrollLeft}
          disabled={scrollPosition <= 0}
          className={`p-1 rounded-full ${
            scrollPosition <= 0 
              ? 'text-gray-600 bg-gray-800 cursor-not-allowed' 
              : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={scrollRight}
          disabled={scrollPosition >= maxScroll}
          className={`p-1 rounded-full ${
            scrollPosition >= maxScroll 
              ? 'text-gray-600 bg-gray-800 cursor-not-allowed' 
              : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      
      {/* Carousel */}
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topGainers.length > 0 ? (
          topGainers.map((pair) => (
            <div 
              key={pair.symbol}
              className={`min-w-[220px] max-w-[220px] snap-start mr-4 bg-gradient-to-br ${getGradient(pair.priceChange24h)} bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-green-500 cursor-pointer transition-all duration-200`}
              onClick={() => onSelectPair(pair.symbol)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-white">{pair.baseAsset}/{pair.quoteAsset}</div>
                  <div className="text-xs text-gray-400">{pair.symbol}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-mono font-medium">{formatPrice(pair.price)}</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    {formatPercent(pair.priceChange24h)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">24h Volume</div>
                  <div className="text-sm font-medium">{formatVolume(pair.volume24h)}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">Velocity</div>
                  <PriceVelocityTicker 
                    velocity={pair.priceVelocity} 
                    trend={pair.velocityTrend} 
                  />
                </div>
              </div>
              
              {/* Price change bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-gray-400">Price Change</div>
                  <div className="text-xs text-green-400">{formatPercent(pair.priceChange24h)}</div>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-300" 
                    style={{ width: `${Math.min(100, pair.priceChange24h * 2)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Rank badge */}
              <div className="absolute top-2 right-2 bg-green-900/50 text-green-400 text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                <BarChart3 size={12} className="mr-1" />
                <span>#{topGainers.indexOf(pair) + 1}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-10 text-center text-gray-500">
            No gainers available for the current timeframe
          </div>
        )}
      </div>
    </div>
  );
};

export default TopGainersCarousel;
