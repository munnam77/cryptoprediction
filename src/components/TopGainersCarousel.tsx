import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VolumeChangeTrendline from './VolumeChangeTrendline';
import LiquidityDepthGauge from './LiquidityDepthGauge';
import FlashSentimentSpike from './FlashSentimentSpike';
import HistoricalVolatilityBadge from './HistoricalVolatilityBadge';
import AudioPing from './AudioPing';
import { MarketData } from '../services/BinanceService';

interface TopGainersCarouselProps {
  gainers: MarketData[];
}

/**
 * TopGainersCarousel - Displays a horizontal scrollable list of top performing coins
 * Shows real-time data for the top gainers with various indicators
 */
const TopGainersCarousel: React.FC<TopGainersCarouselProps> = ({ gainers }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Autoscroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (gainers.length > 0) {
        setActiveIndex((prevIndex) => (prevIndex + 1) % gainers.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [gainers.length]);
  
  // Scroll to active card
  useEffect(() => {
    if (carouselRef.current && gainers.length > 0) {
      const scrollAmount = activeIndex * (carouselRef.current.scrollWidth / gainers.length);
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, gainers.length]);
  
  // Handle manual navigation
  const handlePrev = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? gainers.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setActiveIndex((prevIndex) => 
      (prevIndex + 1) % gainers.length
    );
  };
  
  if (gainers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 bg-opacity-30 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <p>Loading top gainers data...</p>
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
        {gainers.map((gainer) => {
          // Calculate additional metrics for features
          const volumeChangePercent = gainer.volumeChangePercent || 0;
          const priceChangePercent = gainer.priceChangePercent;
          const volatility = gainer.volatility || 50;
          const liquidity = gainer.liquidity || 50;
          
          // Generate volume history array for trendline (mock data based on current value)
          const volumeHistory = [
            volumeChangePercent * 0.7,
            volumeChangePercent * 0.8,
            volumeChangePercent * 0.9,
            volumeChangePercent
          ];
          
          // Determine liquidity trend
          const liquidityTrend = volumeChangePercent > 5 
            ? 'increasing' 
            : volumeChangePercent < -5 
              ? 'decreasing' 
              : 'stable';
          
          // Determine if there's a sentiment spike (simulated)
          const hasSentimentSpike = priceChangePercent > 8 || (priceChangePercent > 3 && volumeChangePercent > 15);
          
          // Map volatility to percentile (0-100)
          const volatilityPercentile = Math.min(100, Math.max(0, volatility));
          
          // Audio ping for significant price movements
          const needsAudioPing = priceChangePercent > 10;
          
          return (
            <div 
              key={gainer.symbol}
              className="min-w-full snap-center px-6 py-3"
            >
              <div className="bg-gray-800 bg-opacity-40 backdrop-blur rounded-lg border border-gray-700 p-4 hover:border-indigo-500 transition-colors">
                {/* Header with Coin Name & Price */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="font-bold text-lg">{gainer.baseAsset}</span>
                    <span className="text-xs text-gray-400 ml-1">{gainer.quoteAsset}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      ${gainer.price.toFixed(gainer.price < 1 ? 6 : 2)}
                    </div>
                    <div className={`text-xs font-bold ${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* Middle Section with Main Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Volume Change % */}
                  <div className="bg-gray-800 rounded-md p-2">
                    <div className="text-xs text-gray-400 mb-1">Volume Change</div>
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-medium ${volumeChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {volumeChangePercent >= 0 ? '+' : ''}{volumeChangePercent.toFixed(1)}%
                      </div>
                      <VolumeChangeTrendline
                        volumeHistory={volumeHistory}
                        className="ml-2"
                      />
                    </div>
                  </div>
                  
                  {/* Liquidity Depth */}
                  <div className="bg-gray-800 rounded-md p-2">
                    <div className="text-xs text-gray-400 mb-1">Liquidity</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {liquidity.toFixed(0)}/100
                      </div>
                      <LiquidityDepthGauge
                        depth={liquidity}
                        trend={liquidityTrend}
                        className="ml-2"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Bottom Section with Feature Indicators */}
                <div className="flex items-center justify-between text-xs">
                  {/* Left side features */}
                  <div className="flex items-center space-x-2">
                    {/* Historical Volatility Badge */}
                    <HistoricalVolatilityBadge
                      percentile={volatilityPercentile}
                      timeframe="1h"
                      className="text-xs"
                    />
                    
                    {/* Flash Sentiment Spike - only shown when triggered */}
                    {hasSentimentSpike && (
                      <FlashSentimentSpike
                        postCount={Math.round(priceChangePercent * 10)}
                        active={true}
                        className="ml-2"
                      />
                    )}
                  </div>
                  
                  {/* Right side features */}
                  <div className="flex items-center space-x-2">
                    {/* Pump Cycle Tag */}
                    {priceChangePercent > 5 && (
                      <div className="px-2 py-0.5 bg-purple-500 bg-opacity-30 border border-purple-500 rounded-full text-purple-300 text-xs">
                        Pump Cycle
                      </div>
                    )}
                    
                    {/* Volume Decay Warning */}
                    {priceChangePercent > 0 && volumeChangePercent < -10 && (
                      <div className="w-3 h-3 transform rotate-180 border-t-4 border-l-4 border-r-4 border-transparent border-t-gray-400 opacity-70" />
                    )}
                  </div>
                </div>
                
                {/* Audio Ping - Hidden component that plays sound when needed */}
                {needsAudioPing && (
                  <AudioPing
                    active={true}
                    type={priceChangePercent >= 0 ? 'gain' : 'loss'}
                    className="hidden"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination Indicators */}
      <div className="flex justify-center mt-3">
        {gainers.map((_, index) => (
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

export default TopGainersCarousel;
