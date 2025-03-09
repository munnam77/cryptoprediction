import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Award, Clock } from 'lucide-react';
import type { MarketData } from '../types/binance';
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
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
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
  const carouselRef = useRef<HTMLDivElement>(null);
  const visibleCards = 3; // Number of cards visible at once
  
  // Auto-scroll the carousel every 10 seconds if not in historical view
  useEffect(() => {
    if (isHistoricalView) return;
    
    const interval = setInterval(() => {
      if (gems.length > visibleCards) {
        handleNext();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [gems.length, currentIndex, isHistoricalView]);
  
  // Handle previous button click
  const handlePrev = () => {
    if (isAnimating || gems.length <= visibleCards) return;
    
    setIsAnimating(true);
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, gems.length - visibleCards) : prev - 1));
    
    setTimeout(() => setIsAnimating(false), 500); // Match transition duration
  };
  
  // Handle next button click
  const handleNext = () => {
    if (isAnimating || gems.length <= visibleCards) return;
    
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
  
  // Get features to display for each card
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
      return 'border-indigo-500';
    };
    
    // Get icon based on market cap and performance
    const getIcon = () => {
      if (data.gemScore && data.gemScore > 80) return <Award className="text-yellow-400" size={16} />;
      if (data.priceChangePercent > 15) return <TrendingUp className="text-green-400" size={16} />;
      if (data.volatility && data.volatility > 80) return <Zap className="text-orange-400" size={16} />;
      return null;
    };
    
    // Get features to show on this card
    const features = getFeaturesToShow(index, data);
    
    return (
      <div 
        key={symbol}
        className={`relative flex-shrink-0 w-[140px] h-[160px] rounded-lg overflow-hidden 
          bg-gradient-to-br from-gray-800 to-gray-900 
          border-2 ${getBorderColor()} 
          shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl
          ${data.volatility && data.volatility > 70 ? 'animate-pulse-slow' : ''}`}
      >
        {/* Card Header */}
        <div className="px-3 py-2 bg-gray-800/80 border-b border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-bold text-white">{baseAsset}</span>
            {getIcon()}
          </div>
          <span className={`text-xs font-medium ${getColorClass(data.priceChangePercent)}`}>
            {data.priceChangePercent > 0 ? '+' : ''}{data.priceChangePercent.toFixed(1)}%
          </span>
        </div>
        
        {/* Card Content */}
        <div className="p-3 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Price</span>
            <span className="font-medium text-white">{formatPrice(data.price)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Vol Chg</span>
            <span className={`text-sm font-medium ${getColorClass(data.volumeChangePercent || 0)}`}>
              {data.volumeChangePercent ? (data.volumeChangePercent > 0 ? '+' : '') + data.volumeChangePercent.toFixed(1) + '%' : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Gem Score</span>
            <div className="flex items-center">
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                  style={{ width: `${data.gemScore || 0}%` }}
                ></div>
              </div>
              <span className="ml-1 text-xs font-medium text-indigo-400">{formatScore(data.gemScore)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{marketCapCategory()}</span>
            <span className="text-xs text-gray-500">{timeframe}</span>
          </div>
        </div>
        
        {/* Features */}
        {features}
      </div>
    );
  };
  
  // If no gems, show empty state
  if (!gems || gems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <p>No low-cap gems found</p>
          <p className="text-sm mt-1">Try changing the timeframe</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full">
      {/* Carousel Navigation */}
      {gems.length > visibleCards && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-r-lg p-1 transition-colors duration-200"
            disabled={isAnimating}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-l-lg p-1 transition-colors duration-200"
            disabled={isAnimating}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
      
      {/* Carousel Track */}
      <div 
        ref={carouselRef}
        className="flex items-center justify-start space-x-4 h-full overflow-hidden px-2"
      >
        <div 
          className="flex space-x-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (140 + 16)}px)` }} // Card width + gap
        >
          {gems.map(renderGemCard)}
        </div>
      </div>
      
      {/* Pagination Dots */}
      {gems.length > visibleCards && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1 pb-1">
          {Array.from({ length: Math.ceil(gems.length / visibleCards) }).map((_, i) => (
            <button
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                Math.floor(currentIndex / visibleCards) === i ? 'bg-indigo-500' : 'bg-gray-600'
              }`}
              onClick={() => {
                setCurrentIndex(i * visibleCards);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopPicksCarousel;
