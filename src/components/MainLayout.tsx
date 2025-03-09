import React, { useState, useEffect } from 'react';
import { MarketData } from '../services/BinanceService';
import TimeframeSelector from './TimeframeSelector';
import TradingDashboard from './TradingDashboard';
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
import MarketMoodOrb from './MarketMoodOrb';
import BTCRippleLine from './BTCRippleLine';
import AudioPing from './AudioPing';

interface MainLayoutProps {
  marketSentiment: number;
  marketVolatility: number;
  btcChangePercent: number;
  marketChangePercent: number;
  selectedTimeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  onTimeframeChange: (timeframe: '15m' | '30m' | '1h' | '4h' | '1d') => Promise<void>;
  topGainers: MarketData[];
  lowCapGems: MarketData[];
  allMarketData: MarketData[];
  isLoading: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  marketSentiment,
  marketVolatility,
  btcChangePercent,
  marketChangePercent,
  selectedTimeframe,
  onTimeframeChange,
  topGainers,
  lowCapGems,
  allMarketData,
  isLoading
}) => {
  const [selectedPair, setSelectedPair] = useState<MarketData | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [audioPingEnabled, setAudioPingEnabled] = useState<boolean>(false);
  const [historicalTimestamp, setHistoricalTimestamp] = useState<number>(Date.now());
  const [isHistoricalView, setIsHistoricalView] = useState<boolean>(false);

  // Update selectedPair when allMarketData changes
  useEffect(() => {
    if (selectedPair && allMarketData.length > 0) {
      // Find the updated version of the selected pair
      const updatedPair = allMarketData.find(pair => pair.symbol === selectedPair.symbol);
      if (updatedPair) {
        setSelectedPair(updatedPair);
      }
    }
  }, [allMarketData]);

  // Format helpers
  const formatChangePercent = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number) => {
    return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
  };

  // Trading pair selection handler
  const handlePairSelect = (pair: MarketData) => {
    setSelectedPair(pair);
    // Optional: Play audio ping when selecting a pair with high volatility
    if (audioPingEnabled && pair.volatility && pair.volatility > 70) {
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

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-gray-100 px-4 py-2">
      {/* Audio Ping Element (hidden) */}
      <AudioPing id="audioPing" enabled={audioPingEnabled} />
      
      {/* Historical data indicator - show when viewing past data */}
      {isHistoricalView && (
        <div className="fixed top-16 right-4 z-50 bg-purple-900 bg-opacity-80 text-white px-3 py-2 rounded-md text-sm">
          <div className="font-medium">Historical View</div>
          <div className="text-xs">{new Date(historicalTimestamp).toLocaleString()}</div>
          <button 
            onClick={() => {
              setHistoricalTimestamp(Date.now());
              setIsHistoricalView(false);
            }}
            className="mt-1 text-xs bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded w-full"
          >
            Return to Live
          </button>
        </div>
      )}
      
      {/* Main Content Area - Following exact layout from context.md */}
      <div className="flex flex-1 overflow-hidden space-x-4">
        {/* Left Panel - Trading Pair Table (30% width) */}
        <div className="w-[30%] overflow-hidden flex flex-col">
          <div className="flex-1 bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700 p-3">
            <h2 className="text-lg font-medium mb-2 flex justify-between items-center">
              <span>Trading Pairs</span>
              <TimeframeSelector 
                selectedTimeframe={selectedTimeframe} 
                onTimeframeChange={onTimeframeChange}
                timeframes={['15m', '30m', '1h', '4h', '1d']} 
              />
            </h2>
            
            {/* Trading Pair Table with all 7 features from context.md */}
            {isLoading ? (
              <LoadingSkeleton type="table" rows={10} />
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-180px)]">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-700">
                      <th className="px-2 py-2 text-left w-[24%]">Pair</th>
                      <th className="px-2 py-2 text-right w-[17%]">Price</th>
                      <th className="px-2 py-2 text-right w-[20%]">{selectedTimeframe} Chg%</th>
                      <th className="px-2 py-2 text-right w-[20%]">Vol Chg%</th>
                      <th className="px-2 py-2 text-right w-[19%]">Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMarketData.map((pair, index) => (
                      <tr 
                        key={pair.symbol}
                        className={`border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer ${
                          selectedPair?.symbol === pair.symbol ? 'bg-gray-700/50' : ''
                        } ${pair.volatility && pair.volatility > 80 ? 'bg-orange-900/20' : ''}`}
                        onClick={() => handlePairSelect(pair)}
                      >
                        <td className="px-2 py-2 relative">
                          <div className="flex items-center">
                            <span className="font-medium">{pair.baseAsset}</span>
                            <span className="ml-1 text-xs text-gray-400">/{pair.quoteAsset}</span>
                            {/* Feature 1: Breakout Alert Badge */}
                            {pair.breakout && (
                              <BreakoutAlert 
                                price={pair.breakout.price}
                                type={pair.breakout.type}
                                className="ml-1"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex items-center justify-end">
                            ${pair.price.toFixed(pair.price < 1 ? 6 : 2)}
                            {/* Feature 6: Price Pivot Dot */}
                            {pair.pivotPoint && (
                              <PricePivotDot 
                                currentPrice={pair.price} 
                                pivotPrice={pair.pivotPoint.price}
                                className="ml-1 w-2 h-2" 
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className={getColorClass(pair.priceChangePercent)}>
                            {formatChangePercent(pair.priceChangePercent)}
                          </span>
                          {/* Feature 3: Trend Strength Icon */}
                          {pair.trend && (
                            <TrendStrengthIcon
                              trend={pair.trend.direction === 'up' ? 'bull' : 'bear'}
                              strength={Math.ceil(pair.trend.strength / 33) as 1 | 2 | 3}
                              className="ml-1 inline-block"
                            />
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className={getColorClass(pair.volumeChangePercent)}>
                            {formatChangePercent(pair.volumeChangePercent)}
                          </span>
                          {/* Feature 2: Volatility Range Bar */}
                          <VolatilityRangeBar
                            volatility={pair.volatility || 0}
                            volatilityRange={[pair.price * 0.99, pair.price * 1.01]}
                            className="mt-1 w-full h-1"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Feature 4: Order Book Imbalance Tag */}
                            <OrderBookImbalanceTag 
                              ratio={pair.orderBookImbalance || 50}
                              volume={pair.volume}
                            />
                            
                            {/* Feature 7: Custom Trigger Pin */}
                            <CustomTriggerPin 
                              symbol={pair.symbol}
                              onClick={() => console.log(`Set alert for ${pair.symbol}`)}
                            />
                          </div>
                          
                          {/* Feature 5: Trader's Hot Zone */}
                          {index < 5 && pair.tradingZones && (
                            <TradersHotZone 
                              zones={pair.tradingZones}
                              currentPrice={pair.price}
                              className="w-full h-1 mt-1"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Center Panel - Prediction Engine (40% width) */}
        <div className="w-[40%] overflow-hidden flex flex-col">
          <div className="flex-1 bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700 p-3">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Prediction Engine</h2>
              <div className="flex items-center space-x-3">
                {/* Feature 8: Scalper's Countdown */}
                <ScalpersCountdown 
                  seconds={getNextUpdateTime()}
                  timeframe={selectedTimeframe}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mb-3">
              {/* Feature 9: Price Velocity Ticker */}
              <PriceVelocityTicker
                velocity={selectedPair?.priceVelocity || 0}
                trend={selectedPair?.priceVelocityTrend || 'stable'}
                className="w-1/3"
              />
              
              {/* Feature 10: Pump Probability Dial */}
              <PumpProbabilityDial
                probability={selectedPair?.pumpProbability || 0}
                timeframe={selectedTimeframe}
                className="w-1/3"
              />
              
              {/* Feature 11: Scalper's Profit Target */}
              <ScalpersProfitTarget 
                target={`${selectedPair?.profitTarget || 5}%`}
                timeframe={selectedTimeframe}
                className="w-1/3"
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
              <PredictionDashboard
                timeframe={selectedTimeframe}
                predictedGainers={lowCapGems.slice(0, 5)}
                actualGainers={topGainers.slice(0, 5)}
                isHistoricalView={isHistoricalView}
                historicalTimestamp={historicalTimestamp}
              />
            )}
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              {/* Feature 12: Micro RSI Bar */}
              <div className="p-2 bg-gray-700 bg-opacity-40 rounded">
                <h4 className="text-xs text-gray-400 mb-1">RSI</h4>
                <MicroRSIBar 
                  value={selectedPair?.rsi || 50}
                  className="w-full h-4"
                />
              </div>
              
              {/* Feature 14: Correlation Heat Dot */}
              <div className="p-2 bg-gray-700 bg-opacity-40 rounded">
                <h4 className="text-xs text-gray-400 mb-1">BTC Correlation</h4>
                <CorrelationHeatDot 
                  correlation={selectedPair?.btcCorrelation || 0}
                  assets={[selectedPair?.symbol?.replace('USDT', '') || 'Unknown', 'BTC']}
                  className="w-full h-4"
                />
              </div>
              
              <div className="p-2 bg-gray-700 bg-opacity-40 rounded flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-xs text-gray-400 mb-1">Alerts</h4>
                  <button 
                    className={`text-xs px-3 py-1 rounded ${alertsEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
                    onClick={() => setAlertsEnabled(!alertsEnabled)}
                  >
                    {alertsEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel (30% width) */}
        <div className="w-[30%] overflow-hidden flex flex-col space-y-4">
          {/* Top Half: Top Picks Cards (Low-Cap Gems) */}
          <div className="h-1/2 bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700 p-3">
            <h2 className="text-lg font-medium mb-2">Top Picks</h2>
            {isLoading ? (
              <LoadingSkeleton type="cards" count={5} />
            ) : (
              <TopPicksCarousel 
                gems={lowCapGems.slice(0, 6)}
                timeframe={selectedTimeframe}
                isHistoricalView={isHistoricalView}
                historicalTimestamp={historicalTimestamp}
              />
            )}
          </div>
          
          {/* Bottom Half: Top Gainers Cards */}
          <div className="h-1/2 bg-gray-800 bg-opacity-60 rounded-lg backdrop-blur-sm border border-gray-700 p-3">
            <h2 className="text-lg font-medium mb-2">Top Gainers</h2>
            {isLoading ? (
              <LoadingSkeleton type="cards" count={5} />
            ) : (
              <TopGainersCarousel 
                gainers={topGainers.slice(0, 6)}
                timeframe={selectedTimeframe}
                audioPingEnabled={audioPingEnabled}
                onToggleAudioPing={() => setAudioPingEnabled(!audioPingEnabled)}
                isHistoricalView={isHistoricalView}
                historicalTimestamp={historicalTimestamp}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-center text-gray-300">Loading market data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
