import React, { useState, useEffect, useRef } from 'react';
import type { MarketData, TimeFrame } from '../types/binance';
import TimeframeSelector from './TimeframeSelector';
import PredictionDashboard from './PredictionDashboard';
import TopPicksCarousel from './TopPicksCarousel';
import TopGainersCarousel from './TopGainersCarousel';
import BreakoutAlert from './BreakoutAlert';
import VolatilityRangeBar from './VolatilityRangeBar';
import TrendStrengthIcon from './TrendStrengthIcon';
import OrderBookImbalanceTag from './OrderBookImbalanceTag';
import TradersHotZone from './TradersHotZone';
import PricePivotDot from './PricePivotDot';
import CustomTriggerPin from './CustomTriggerPin';
import ScalpersCountdown from './ScalpersCountdown';
import PriceVelocityTicker from './PriceVelocityTicker';
import PumpProbabilityDial from './PumpProbabilityDial';
import ScalpersProfitTarget from './ScalpersProfitTarget';
import MicroRSIBar from './MicroRSIBar';
import TimeframeRewindSlider from './TimeframeRewindSlider';
import CorrelationHeatDot from './CorrelationHeatDot';
import LoadingSkeleton from './LoadingSkeleton';
import AudioPing from './AudioPing';
import { ChevronLeft, ChevronRight, Zap, TrendingUp, BarChart3, Layers, ArrowUpDown } from 'lucide-react';

interface MainLayoutProps {
  marketSentiment: number;
  marketVolatility: number;
  btcChangePercent: number;
  marketChangePercent: number;
  selectedTimeframe: TimeFrame;
  onTimeframeChange: (timeframe: TimeFrame) => void;
  topGainers: MarketData[];
  lowCapGems: MarketData[];
  allMarketData: MarketData[];
  isLoading: boolean;
  availableFeatures: {
    marketData: boolean;
    predictions: boolean;
    topGainers: boolean;
    lowCapGems: boolean;
    alerts: boolean;
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  topGainers,
  lowCapGems,
  allMarketData,
  isLoading,
  marketSentiment,
  marketVolatility,
  btcChangePercent,
  marketChangePercent
}) => {
  const [selectedPair, setSelectedPair] = useState<MarketData | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [audioPingEnabled, setAudioPingEnabled] = useState<boolean>(false);
  const [historicalTimestamp, setHistoricalTimestamp] = useState<number>(Date.now());
  const [isHistoricalView, setIsHistoricalView] = useState<boolean>(false);
  const [showHotZone, setShowHotZone] = useState<boolean>(true);
  const [showTradingPairs, setShowTradingPairs] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'prediction' | 'balanced' | 'trading'>('prediction');
  const [isTimeframeChanging, setIsTimeframeChanging] = useState<boolean>(false);
  const prevTimeframeRef = useRef<TimeFrame>(selectedTimeframe);

  // Helper to parse trading pair symbol
  const parseSymbol = (symbol: string) => {
    const quoteAsset = symbol.slice(-4);  // USDT is 4 chars
    const baseAsset = symbol.slice(0, -4);
    return { baseAsset, quoteAsset };
  };

  // Format helpers
  const formatChangePercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0.00%';
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'text-gray-400';
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
  };

  // Update selectedPair when allMarketData changes
  useEffect(() => {
    if (selectedPair && allMarketData.length > 0) {
      const updatedPair = allMarketData.find(pair => pair.symbol === selectedPair.symbol);
      if (updatedPair) {
        setSelectedPair(updatedPair);
      }
    } else if (allMarketData.length > 0 && !selectedPair) {
      // Auto-select the first pair if none is selected
      setSelectedPair(allMarketData[0]);
    }
  }, [allMarketData, selectedPair]);

  // Trading pair selection handler
  const handlePairSelect = (pair: MarketData) => {
    setSelectedPair(pair);
    // Play audio ping when selecting a pair with high volatility
    if (audioPingEnabled && (pair.volatility || 0) > 70) {
      const audioElement = document.getElementById('audioPing') as HTMLAudioElement;
      if (audioElement) audioElement.play();
    }
  };

  // Countdown to next data refresh
  const getNextUpdateTime = () => {
    const now = new Date();
    let minutes = 0;
    
    switch (selectedTimeframe) {
      case '15m': minutes = 15 - (now.getMinutes() % 15); break;
      case '30m': minutes = 30 - (now.getMinutes() % 30); break;
      case '1h': minutes = 60 - now.getMinutes(); break;
      case '4h': minutes = 240 - ((now.getHours() % 4) * 60 + now.getMinutes()); break;
      case '1d': 
        const hoursTo9am = (9 - now.getHours() + 24) % 24;
        minutes = hoursTo9am * 60 - now.getMinutes();
        break;
    }
    
    return minutes * 60 - now.getSeconds(); // Convert to seconds
  };

  // Handle timeframe rewind slider changes
  const handleTimeRewind = (timestamp: number) => {
    setHistoricalTimestamp(timestamp);
    setIsHistoricalView(timestamp < Date.now() - 60000); // If more than 1 minute in the past
    
    // Here you could fetch historical data based on timestamp
    // This would typically involve API calls to get snapshots from that time
    console.log(`Viewing data from: ${new Date(timestamp).toLocaleString()}`);
  };

  // Update trading pair table section to use correct prop types
  const renderTradingPairRow = (pair: MarketData) => {
    const { baseAsset, quoteAsset } = parseSymbol(pair.symbol);
    const isHighVolatility = (pair.volatility || 0) > 80;
    const isSelected = selectedPair?.symbol === pair.symbol;
    
    return (
      <tr 
        key={pair.symbol}
        className={`border-b border-gray-700/30 hover:bg-gray-700/40 cursor-pointer transition-colors duration-200 ${
          isSelected ? 'bg-gray-700/50 border-l-2 border-l-indigo-500' : ''
        } ${isHighVolatility ? 'bg-orange-900/20' : ''}`}
        onClick={() => handlePairSelect(pair)}
      >
        <td className="px-3 py-3 relative">
          <div className="flex items-center">
            <span className="font-medium text-white">{baseAsset}</span>
            <span className="ml-1 text-xs text-gray-400">{quoteAsset}</span>
            {pair.breakout && (
              <BreakoutAlert 
                breakout={pair.breakout}
                currentPrice={pair.price}
                className="ml-2"
              />
            )}
          </div>
        </td>
        <td className="px-3 py-3 text-right">
          <div className="flex items-center justify-end">
            <span className="font-medium">${pair.price.toFixed(pair.price < 1 ? 6 : 2)}</span>
            {pair.pivotPoint && (
              <PricePivotDot 
                pivotPoint={pair.pivotPoint}
                currentPrice={pair.price}
                className="ml-2 w-2 h-2" 
              />
            )}
          </div>
        </td>
        <td className="px-3 py-3 text-right">
          <span className={`${getColorClass(pair.priceChangePercent)} font-medium`}>
            {formatChangePercent(pair.priceChangePercent)}
          </span>
          {pair.trend && (
            <TrendStrengthIcon
              direction={pair.trend.direction}
              strength={pair.trend.strength}
              className="ml-2 inline-block"
            />
          )}
        </td>
        <td className="px-3 py-3 text-right">
          <span className={`${getColorClass(pair.volumeChangePercent)} font-medium`}>
            {formatChangePercent(pair.volumeChangePercent)}
          </span>
          <VolatilityRangeBar
            volatility={pair.volatility || 0}
            price={pair.price}
            className="mt-2 w-full h-1"
          />
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center justify-end space-x-2">
            <OrderBookImbalanceTag 
              imbalance={pair.orderBookImbalance || 50}
              volume={pair.volume}
            />
            <CustomTriggerPin 
              symbol={pair.symbol}
              onClick={() => console.log(`Set alert for ${pair.symbol}`)}
            />
          </div>
          {pair.tradingZones && showHotZone && (
            <TradersHotZone 
              zones={pair.tradingZones}
              currentPrice={pair.price}
              className="w-full h-1 mt-2"
            />
          )}
        </td>
      </tr>
    );
  };

  // Update trading pair table section
  const renderTradingPairTable = () => (
    <table className="w-full table-fixed">
      <thead>
        <tr className="text-xs text-gray-400 border-b border-gray-700/50">
          <th className="px-3 py-3 text-left w-[24%]">Pair</th>
          <th className="px-3 py-3 text-right w-[17%]">Price</th>
          <th className="px-3 py-3 text-right w-[20%]">{selectedTimeframe} Chg%</th>
          <th className="px-3 py-3 text-right w-[20%]">Vol Chg%</th>
          <th className="px-3 py-3 text-right w-[19%]">
            <div className="flex items-center justify-end">
              <span>Features</span>
              <button 
                onClick={() => setShowHotZone(!showHotZone)}
                className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-1.5 py-0.5 rounded"
                title={showHotZone ? "Hide hot zones" : "Show hot zones"}
              >
                {showHotZone ? "Hide" : "Show"}
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {allMarketData.map(renderTradingPairRow)}
      </tbody>
    </table>
  );

  // Layout toggle handler
  const toggleLayout = () => {
    if (layoutMode === 'prediction') {
      setLayoutMode('balanced');
    } else if (layoutMode === 'balanced') {
      setLayoutMode('trading');
    } else {
      setLayoutMode('prediction');
    }
  };

  // Get layout classes based on current mode
  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'prediction':
        return {
          tradingPanel: 'w-0 hidden md:block md:w-[20%] lg:w-[25%]',
          predictionPanel: 'w-[60%] md:w-[50%] lg:w-[45%]',
          topPicksPanel: 'w-[40%] md:w-[30%] lg:w-[30%]'
        };
      case 'balanced':
        return {
          tradingPanel: 'w-[25%] md:w-[25%] lg:w-[25%]',
          predictionPanel: 'w-[45%] md:w-[45%] lg:w-[45%]',
          topPicksPanel: 'w-[30%] md:w-[30%] lg:w-[30%]'
        };
      case 'trading':
        return {
          tradingPanel: 'w-[40%] md:w-[35%] lg:w-[35%]',
          predictionPanel: 'w-[35%] md:w-[35%] lg:w-[35%]',
          topPicksPanel: 'w-[25%] md:w-[30%] lg:w-[30%]'
        };
      default:
        return {
          tradingPanel: 'w-[25%]',
          predictionPanel: 'w-[45%]',
          topPicksPanel: 'w-[30%]'
        };
    }
  };

  const layoutClasses = getLayoutClasses();

  // Handle timeframe changes with animation
  useEffect(() => {
    if (prevTimeframeRef.current !== selectedTimeframe) {
      // Timeframe has changed
      setIsTimeframeChanging(true);
      console.log(`MainLayout detected timeframe change to: ${selectedTimeframe}`);
      
      // Animate the transition
      setTimeout(() => {
        setIsTimeframeChanging(false);
        prevTimeframeRef.current = selectedTimeframe;
      }, 800);
    }
  }, [selectedTimeframe]);

  // Enhanced timeframe change handler
  const handleTimeframeChangeWithFeedback = (timeframe: TimeFrame) => {
    if (timeframe !== selectedTimeframe) {
      setIsTimeframeChanging(true);
      onTimeframeChange(timeframe);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-gray-100 px-4 py-2">
      {/* Audio Ping Element (hidden) */}
      <AudioPing id="audioPing" enabled={audioPingEnabled} />
      
      {/* Historical data indicator - show when viewing past data */}
      {isHistoricalView && (
        <div className="fixed top-16 right-4 z-50 bg-purple-900/90 text-white px-3 py-2 rounded-md text-sm backdrop-blur-sm border border-purple-700/50 shadow-lg animate-fade-in">
          <div className="font-medium">Historical View</div>
          <div className="text-xs">{new Date(historicalTimestamp).toLocaleString()}</div>
          <button 
            onClick={() => {
              setHistoricalTimestamp(Date.now());
              setIsHistoricalView(false);
            }}
            className="mt-2 text-xs bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded w-full transition-colors duration-200"
          >
            Return to Live
          </button>
        </div>
      )}
      
      {/* Market Overview Bar */}
      <div className="mb-4 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-700/50 p-3 flex flex-wrap md:flex-nowrap items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Market Sentiment</span>
            <span className={`font-medium ${marketSentiment > 60 ? 'text-green-400' : marketSentiment < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
              {marketSentiment.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Volatility</span>
            <span className={`font-medium ${marketVolatility > 70 ? 'text-orange-400' : marketVolatility > 40 ? 'text-yellow-400' : 'text-blue-400'}`}>
              {marketVolatility.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">BTC Change</span>
            <span className={`font-medium ${getColorClass(btcChangePercent)}`}>
              {formatChangePercent(btcChangePercent)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Market Change</span>
            <span className={`font-medium ${getColorClass(marketChangePercent)}`}>
              {formatChangePercent(marketChangePercent)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TimeframeSelector 
            selectedTimeframe={selectedTimeframe} 
            onTimeframeChange={handleTimeframeChangeWithFeedback}
            timeframes={['15m', '30m', '1h', '4h', '1d']} 
          />
          <button 
            onClick={toggleLayout}
            className="flex items-center justify-center p-2 bg-indigo-600/80 hover:bg-indigo-500/80 rounded-md transition-colors duration-200"
            title="Toggle layout mode"
          >
            <Layers size={16} />
          </button>
        </div>
      </div>
      
      {/* Main Content Area - Redesigned for better focus on predictions and top picks */}
      <div className="flex flex-1 overflow-hidden space-x-4 transition-all duration-300 ease-in-out">
        {/* Left Panel - Trading Pair Table (collapsible) */}
        <div className={`${layoutClasses.tradingPanel} overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}>
          <div className="flex-1 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-700/50 p-3 shadow-lg">
            <h2 className="text-lg font-medium mb-3 flex justify-between items-center">
              <span>Trading Pairs</span>
              <span className="text-sm text-gray-400">{allMarketData.length} pairs</span>
            </h2>
            
            {isLoading ? (
              <LoadingSkeleton type="table" rows={10} />
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {renderTradingPairTable()}
              </div>
            )}
          </div>
        </div>
        
        {/* Center Panel - Prediction Engine (expanded) */}
        <div className={`${layoutClasses.predictionPanel} overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}>
          <div className="flex-1 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-700/50 p-3 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Zap size={20} className="text-indigo-400 mr-2" />
                <h2 className="text-lg font-medium">Prediction Engine</h2>
              </div>
              <div className="flex items-center space-x-3">
                {/* Feature 8: Scalper's Countdown */}
                <ScalpersCountdown 
                  seconds={getNextUpdateTime()}
                  timeframe={selectedTimeframe}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap space-x-0 md:space-x-4 space-y-2 md:space-y-0 mb-4">
              {/* Feature 9: Price Velocity Ticker */}
              <PriceVelocityTicker
                velocity={selectedPair?.priceVelocity || 0}
                trend={selectedPair?.priceVelocityTrend || 'stable'}
                className="w-full md:w-1/3"
              />
              
              {/* Feature 10: Pump Probability Dial */}
              <PumpProbabilityDial
                probability={selectedPair?.pumpProbability || 0}
                timeframe={selectedTimeframe}
                className="w-full md:w-1/3"
              />
              
              {/* Feature 11: Scalper's Profit Target */}
              <ScalpersProfitTarget 
                value={selectedPair?.profitTarget || 5}
                timeframe={selectedTimeframe}
                className="w-full md:w-1/3"
              />
            </div>
            
            {/* Feature 13: Timeframe Rewind Slider at the top of predictions */}
            <div className="mb-4">
              <TimeframeRewindSlider
                timestamp={Date.now()}
                timeframe={selectedTimeframe}
                onUpdate={handleTimeRewind}
                className="w-full"
              />
            </div>
            
            {/* Main Prediction Dashboard */}
            {isLoading ? (
              <LoadingSkeleton type="predictions" rows={5} />
            ) : (
              <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700/30">
                <PredictionDashboard
                  timeframe={selectedTimeframe}
                  predictedGainers={lowCapGems.slice(0, 5)}
                  actualGainers={topGainers.slice(0, 5)}
                  isHistoricalView={isHistoricalView}
                  historicalTimestamp={historicalTimestamp}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {/* Feature 12: Micro RSI Bar */}
              <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-600/30 hover:border-indigo-500/30 transition-colors duration-200">
                <h4 className="text-xs text-gray-400 mb-1">RSI</h4>
                <MicroRSIBar 
                  value={selectedPair?.rsi || 50}
                  className="w-full h-4"
                />
              </div>
              
              {/* Feature 14: Correlation Heat Dot */}
              <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-600/30 hover:border-indigo-500/30 transition-colors duration-200">
                <h4 className="text-xs text-gray-400 mb-1">BTC Correlation</h4>
                <CorrelationHeatDot 
                  value={selectedPair?.btcCorrelation || 0}
                  baseAsset={selectedPair?.baseAsset || 'Unknown'}
                  className="w-full h-4"
                />
              </div>
              
              <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-600/30 hover:border-indigo-500/30 transition-colors duration-200 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-xs text-gray-400 mb-1">Alerts</h4>
                  <button 
                    className={`text-xs px-3 py-1 rounded transition-colors duration-200 ${alertsEnabled ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                    onClick={() => setAlertsEnabled(!alertsEnabled)}
                  >
                    {alertsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Top Picks and Gainers (combined) */}
        <div className={`${layoutClasses.topPicksPanel} overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}>
          {/* Top Picks Section (Low-Cap Gems) - Expanded */}
          <div className="flex-1 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-700/50 p-3 shadow-lg mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <TrendingUp size={20} className="text-green-400 mr-2" />
                <h2 className="text-lg font-medium">Top Picks</h2>
              </div>
              <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">Low-Cap Gems</span>
            </div>
            {isLoading ? (
              <LoadingSkeleton type="cards" count={5} />
            ) : (
              <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700/30">
                <TopPicksCarousel 
                  gems={lowCapGems.slice(0, 6)}
                  timeframe={selectedTimeframe}
                  isHistoricalView={isHistoricalView}
                  historicalTimestamp={historicalTimestamp}
                />
              </div>
            )}
          </div>
          
          {/* Top Gainers Section */}
          <div className="flex-1 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-700/50 p-3 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <BarChart3 size={20} className="text-orange-400 mr-2" />
                <h2 className="text-lg font-medium">Top Gainers</h2>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Audio</span>
                <button 
                  className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${audioPingEnabled ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                  onClick={() => setAudioPingEnabled(!audioPingEnabled)}
                >
                  {audioPingEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
            {isLoading ? (
              <LoadingSkeleton type="cards" count={5} />
            ) : (
              <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700/30">
                <TopGainersCarousel 
                  gainers={topGainers.slice(0, 6)}
                  timeframe={selectedTimeframe}
                  audioPingEnabled={audioPingEnabled}
                  onToggleAudioPing={() => setAudioPingEnabled(!audioPingEnabled)}
                  isHistoricalView={isHistoricalView}
                  historicalTimestamp={historicalTimestamp}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800/90 rounded-lg p-6 shadow-xl border border-gray-700/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-center text-gray-300">Loading market data...</p>
          </div>
        </div>
      )}

      {/* Timeframe Change Indicator */}
      {isTimeframeChanging && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800/90 rounded-lg p-6 shadow-xl border border-indigo-500/30 animate-timeframe-change">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-400">{selectedTimeframe}</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-300">Updating to {selectedTimeframe} timeframe...</p>
            <div className="mt-4 w-48 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-shimmer"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
