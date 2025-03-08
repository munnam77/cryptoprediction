import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Award } from 'lucide-react';
import { MarketData } from '../services/BinanceService';

interface TopPicksCarouselProps {
  gems: MarketData[];
}

/**
 * TopPicksCarousel Component
 * Displays a carousel of low-cap cryptocurrency gems with potential
 */
const TopPicksCarousel: React.FC<TopPicksCarouselProps> = ({ gems }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (gems.length > 0) {
        setActiveIndex((prevIndex) => (prevIndex + 1) % gems.length);
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [gems.length]);
  
  // Scroll to active card
  useEffect(() => {
    if (carouselRef.current && gems.length > 0) {
      const scrollAmount = activeIndex * (carouselRef.current.scrollWidth / gems.length);
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, gems.length]);
  
  // Navigation handlers
  const handlePrev = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? gems.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setActiveIndex((prevIndex) => 
      (prevIndex + 1) % gems.length
    );
  };
  
  if (gems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 bg-opacity-30 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <p>Loading low-cap gems data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Navigation buttons */}
      <button 
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-70 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      <button 
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-70 rounded-full p-1 text-gray-300 hover:text-white focus:outline-none"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {gems.map((gem) => {
          // Get market cap category (Very Small, Small, Medium)
          const marketCapCategory = () => {
            const marketCap = gem.marketCap || 50000000; // Default value if undefined
            if (marketCap < 10000000) return 'Very Small Cap';
            if (marketCap < 100000000) return 'Small Cap';
            return 'Medium Cap';
          };
          
          // Calculate percentiles and risk score
          const volatilityScore = gem.volatility || 50;
          const liquidityScore = gem.liquidity || 50;
          const volumeChangePercent = gem.volumeChangePercent || 0;
          const priceChangePercent = gem.priceChangePercent;
          const marketCap = gem.marketCap || 50000000; // Default value if undefined
          
          // Risk score (0-100): higher volatility/lower liquidity = higher risk
          const riskScore = Math.min(100, Math.max(0, 
            (volatilityScore * 0.7) + ((100 - liquidityScore) * 0.3)
          ));
          
          // Potential score (0-100): combines price change, volume change, and volatility
          const potentialScore = Math.min(100, Math.max(0,
            (Math.max(0, priceChangePercent) * 0.4) + 
            (Math.max(0, volumeChangePercent) * 0.3) + 
            (volatilityScore * 0.3)
          ));
          
          // Determine icon to display (TrendingUp, Zap, Award)
          const getIcon = () => {
            if (potentialScore > 70) return <Award className="h-4 w-4 text-yellow-400" />;
            if (potentialScore > 50) return <Zap className="h-4 w-4 text-cyan-400" />;
            return <TrendingUp className="h-4 w-4 text-green-400" />;
          };
          
          return (
            <div 
              key={gem.symbol}
              className="min-w-full snap-center px-6 py-3"
            >
              <div className="bg-gray-800 bg-opacity-40 backdrop-blur rounded-lg border border-gray-700 p-4 hover:border-indigo-500 transition-colors">
                {/* Header with Coin Name & Category */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold text-lg">{gem.baseAsset}</span>
                      <span className="text-xs text-gray-400 ml-1">{gem.quoteAsset}</span>
                    </div>
                    <div className="text-xs text-gray-400">{marketCapCategory()}</div>
                  </div>
                  <div className="flex items-center">
                    {getIcon()}
                    <span className="ml-1 text-xs font-medium">
                      Potential: {Math.round(potentialScore)}/100
                    </span>
                  </div>
                </div>
                
                {/* Price & Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Current Price</div>
                    <div className="text-md font-medium">
                      ${gem.price.toFixed(gem.price < 1 ? 6 : 2)}
                    </div>
                    <div className={`text-xs ${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                    <div className="text-md font-medium">
                      ${(marketCap / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                
                {/* Risk & Volatility Bars */}
                <div className="space-y-3 mb-4">
                  {/* Risk Level */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Risk Level</span>
                      <span className="text-xs font-medium">
                        {riskScore < 33 ? 'Low' : riskScore < 66 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          riskScore < 33 ? 'bg-green-400' : 
                          riskScore < 66 ? 'bg-yellow-400' : 
                          'bg-red-400'
                        }`}
                        style={{ width: `${riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Volatility */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Volatility</span>
                      <span className="text-xs font-medium">{volatilityScore.toFixed(0)}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${volatilityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Liquidity */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Liquidity</span>
                      <span className="text-xs font-medium">{liquidityScore.toFixed(0)}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${liquidityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Tags section */}
                <div className="flex flex-wrap gap-2">
                  {/* Conditional tags based on metrics */}
                  {volatilityScore > 70 && (
                    <div className="px-2 py-0.5 bg-purple-500 bg-opacity-20 border border-purple-500 rounded-full text-purple-300 text-xs">
                      High Volatility
                    </div>
                  )}
                  
                  {liquidityScore < 30 && (
                    <div className="px-2 py-0.5 bg-red-500 bg-opacity-20 border border-red-500 rounded-full text-red-300 text-xs">
                      Low Liquidity
                    </div>
                  )}
                  
                  {volumeChangePercent > 50 && (
                    <div className="px-2 py-0.5 bg-green-500 bg-opacity-20 border border-green-500 rounded-full text-green-300 text-xs">
                      Volume Surge
                    </div>
                  )}
                  
                  {(priceChangePercent > 0 && volumeChangePercent > 0) && (
                    <div className="px-2 py-0.5 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-full text-blue-300 text-xs">
                      Growth Potential
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination Indicators */}
      <div className="flex justify-center mt-3">
        {gems.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full mx-1 ${
              index === activeIndex ? 'bg-indigo-500' : 'bg-gray-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TopPicksCarousel;
