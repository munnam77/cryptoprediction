import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Award, Clock } from 'lucide-react';
import { MarketData } from '../services/BinanceService';
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
 * Displays a carousel of low-cap cryptocurrency gems with potential
 */
const TopPicksCarousel: React.FC<TopPicksCarouselProps> = ({ 
  gems, 
  timeframe,
  isHistoricalView = false,
  historicalTimestamp = Date.now()
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-rotate carousel (only if not in historical view)
  useEffect(() => {
    if (isHistoricalView) return;
    
    const interval = setInterval(() => {
      if (gems.length > 0) {
        setActiveIndex((prevIndex) => (prevIndex + 1) % gems.length);
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [gems.length, isHistoricalView]);
  
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

  // Helper function to format price based on value
  const formatPrice = (price: number): string => {
    if (price < 0.001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    return price.toFixed(2);
  };

  // Helper function to get color class for percent change
  const getColorClass = (value: number): string => {
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-300';
  };

  // Get features to display - rotate between 3-4 features per card
  const getFeaturesToShow = (index: number, data: MarketData): JSX.Element[] => {
    // Calculate which features to show based on index and volatility
    const features: JSX.Element[] = [];
    
    // Add features conditionally - we'll rotate through them based on index
    if (index % 5 === 0 || data.volatility && data.volatility > 80) {
      features.push(
        <VolatilityWaveform 
          key="volatility"
          volatility={data.volatility || 0}
          trend={data.volatilityTrend || 'stable'}
          className="absolute bottom-0 left-0 right-0 h-8"
        />
      );
    }
    if (index % 5 === 1 || data.momentum && Math.abs(data.momentum) > 70) {
      features.push(
        <MomentumArrow 
          key="momentum"
          direction={data.momentum && data.momentum > 0 ? 'up' : 'down'}
          strength={Math.abs(data.momentum || 0)}
          className="absolute top-2 right-2 w-6 h-6"
        />
      );
    }
    if (index % 5 === 2 || data.sentiment && data.sentiment > 75) {
      features.push(
        <SentimentPulseDot 
          key="sentiment"
          sentiment={data.sentiment || 50}
          source="social" 
          className="absolute top-2 left-2 w-4 h-4"
        />
      );
    }
    // Show signal beam on alternate cards
    if (index % 2 === 0 && data.signalStrength && data.signalStrength > 70) {
      features.push(
        <LiveTradeSignalBeam 
          key="signal"
          direction={data.signalDirection || 'neutral'}
          strength={data.signalStrength || 0}
          className="absolute inset-0 z-10"
        />
      );
    }
    // Show fireworks on high volatility
    if (data.volatility && data.volatility > 85) {
      features.push(
        <VolatilityFireworks 
          key="fireworks"
          intensity={data.volatility}
          className="absolute inset-0 z-20"
        />
      );
    }

    // Don't show Quick Trade button in historical view
    if (!isHistoricalView) {
      features.push(
        <QuickTradeButton 
          key="trade"
          symbol={data.symbol}
          action={data.signalDirection === 'buy' ? 'buy' : 'sell'}
          price={data.price}
          className="absolute bottom-2 right-2"
        />
      );
    }

    // Streak counter if available
    if (data.trend && data.trend.duration > 3) {
      features.push(
        <ScalpersStreakCounter 
          key="streak"
          count={data.trend.duration}
          direction={data.trend.direction === 'up' ? 'up' : 'down'}
          className="absolute bottom-2 left-2"
        />
      );
    }
    // Risk dot on all cards
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
        data.whaleActivity.buyPressure > 70 || 
        data.whaleActivity.sellPressure > 70) {
      features.push(
        <WhaleTailIcon 
          key="whale"
          type={data.whaleActivity.buyPressure > data.whaleActivity.sellPressure ? 'buying' : 'selling'}
          size={data.whaleActivity.lastTransaction?.amount || 0}
          className="absolute top-8 right-2 w-6 h-6"
        />
      );
    }

    // Add historical icon if in historical view
    if (isHistoricalView) {
      features.push(
        <div 
          key="historical-badge"
          className="absolute bottom-2 right-2 bg-purple-800 rounded-full p-1"
          title="Historical data"
        >
          <Clock className="w-4 h-4 text-purple-200" />
        </div>
      );
    }

    return features;
  };

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
        {gems.map((gem, index) => {
          // Get market cap category (Very Small, Small, Medium)
          const marketCapCategory = () => {
            const marketCap = gem.marketCap || 50000000; // Default value if undefined
            if (marketCap < 10000000) return 'Very Small Cap';
            if (marketCap < 100000000) return 'Small Cap';
            return 'Medium Cap';
          };
          
          // Calculate volatility score with default fallback
          const volatilityScore = gem.volatility || 0;
          const liquidityScore = gem.liquidity || 0;
          const volumeChangePercent = gem.volumeChangePercent || 0;
          const priceChangePercent = gem.priceChangePercent || 0;
          const marketCap = gem.marketCap || 50000000;

          // Safely format score display
          const formatScore = (score: number | undefined): string => {
            if (typeof score !== 'number' || isNaN(score)) return '0';
            return score.toFixed(0);
          };

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
              <div className={`bg-gray-800 bg-opacity-40 backdrop-blur rounded-lg border ${
                isHistoricalView 
                  ? 'border-purple-700' 
                  : 'border-gray-700 hover:border-indigo-500'
              } p-4 transition-colors relative`}>
                {/* Historical view indicator */}
                {isHistoricalView && (
                  <div className="absolute -top-2 -right-2 bg-purple-800 px-2 py-0.5 rounded text-xs font-medium text-white z-30">
                    Historical
                  </div>
                )}

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
                      ${formatPrice(gem.price || 0)}
                    </div>
                    <div className={`text-xs ${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChangePercent !== undefined && !isNaN(priceChangePercent) ? 
                        (priceChangePercent >= 0 ? '+' : '') + Number(priceChangePercent).toFixed(2) + '%'
                        : '--'}
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
                      <span className="text-xs font-medium">{formatScore(volatilityScore)}/100</span>
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
                      <span className="text-xs font-medium">{formatScore(liquidityScore)}/100</span>
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

                  {isHistoricalView && (
                    <div className="px-2 py-0.5 bg-purple-500 bg-opacity-20 border border-purple-500 rounded-full text-purple-300 text-xs">
                      Historical Data
                    </div>
                  )}
                </div>

                {/* Features - display 3-4 features per card */}
                {getFeaturesToShow(index, gem)}
                
                {/* Overlay for cards with signals (only in live view) */}
                {!isHistoricalView && gem.signalStrength && gem.signalStrength > 80 && (
                  <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg animate-pulse z-5"></div>
                )}
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
              index === activeIndex ? (isHistoricalView ? 'bg-purple-500' : 'bg-indigo-500') : 'bg-gray-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Historical timestamp display */}
      {isHistoricalView && (
        <div className="text-center mt-2 text-xs text-purple-300">
          Data from: {new Date(historicalTimestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default TopPicksCarousel;
