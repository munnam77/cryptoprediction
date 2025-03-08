import React, { useState } from 'react';
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
import VolatilityWaveform from './VolatilityWaveform';
import VolumeSurgeSpike from './VolumeSurgeSpike';
import MomentumArrow from './MomentumArrow';
import SentimentPulseDot from './SentimentPulseDot';
import LiveTradeSignalBeam from './LiveTradeSignalBeam';
import VolatilityFireworks from './VolatilityFireworks';
import QuickTradeButton from './QuickTradeButton';
import ScalpersStreakCounter from './ScalpersStreakCounter';
import RiskSnapDot from './RiskSnapDot';
import WhaleTailIcon from './WhaleTailIcon';

interface TradingDashboardProps {
  className?: string;
}

/**
 * TradingDashboard Component
 * Main dashboard integrating all trading components
 */
const TradingDashboard: React.FC<TradingDashboardProps> = ({
  className = ''
}) => {
  // Sample data for demonstration
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('15m');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  
  // Sample market data
  const marketData = {
    price: 48250.75,
    priceChange24h: 3.25,
    volume24h: 12500000,
    high24h: 49100.50,
    low24h: 47200.25,
    volatility: 65, // 0-100
    rsi: 62, // 0-100
    trend: 'bull' as 'bull' | 'bear',
    trendStrength: 2 as 1 | 2 | 3,
    orderBookImbalance: 0.65, // 0-1, higher means more buy orders
    pivotPoints: [47500, 48000, 48500, 49000],
    correlationWithBTC: 1, // -1 to 1
    pumpProbability: 72, // 0-100
    sentimentScore: 0.68, // -1 to 1
    whaleActivity: 'buying' as 'buying' | 'selling' | 'neutral',
    whaleTransactionSize: 2500000, // in USD
    consecutiveWins: 3,
    consecutiveLosses: 0,
    totalTrades: 15,
    riskLevel: 'medium' as 'low' | 'medium' | 'high' | 'extreme',
    riskScore: 45, // 0-100
  };
  
  // Calculate profit targets
  const profitTargets = {
    entryPrice: marketData.price,
    targetPrice: marketData.trend === 'bull' 
      ? marketData.price * 1.05 
      : marketData.price * 0.95,
    stopLossPrice: marketData.trend === 'bull'
      ? marketData.price * 0.98
      : marketData.price * 1.02,
    riskRewardRatio: 2.5
  };
  
  // Handle trade execution
  const handleTrade = (tradeDetails: any) => {
    console.log('Trade executed:', tradeDetails);
    // In a real app, this would call an API to execute the trade
  };
  
  // Handle alert setting
  const handleSetAlert = (alertSettings: any) => {
    console.log('Alert set:', alertSettings);
    // In a real app, this would save the alert settings
  };
  
  return (
    <div className={`p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {selectedSymbol} Trading Dashboard
        </h2>
        
        {/* Timeframe selector */}
        <div className="flex space-x-2">
          {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-2 py-1 text-xs font-medium rounded ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price and indicators section */}
      <div className="flex items-center mb-6">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mr-3">
          ${marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className={`text-sm font-medium ${
          marketData.priceChange24h >= 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {marketData.priceChange24h >= 0 ? '+' : ''}{marketData.priceChange24h}%
        </div>
        
        <div className="ml-auto flex items-center space-x-3">
          <ScalpersCountdown 
            remainingTime={45} 
            duration={60} 
            timeframe={selectedTimeframe} 
          />
          
          <PumpProbabilityDial 
            probability={marketData.pumpProbability} 
            timeframe={selectedTimeframe}
          />
          
          <RiskSnapDot 
            riskLevel={marketData.riskLevel} 
            riskScore={marketData.riskScore} 
          />
          
          <BreakoutAlert 
            breakoutType="resistance" 
            price={marketData.price} 
            breakoutPrice={marketData.pivotPoints[2]} 
            breakoutTime="14:30"
          />
        </div>
      </div>
      
      {/* Main indicators grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trend</h3>
          <div className="flex items-center space-x-3">
            <TrendStrengthIcon 
              trend={marketData.trend} 
              strength={marketData.trendStrength} 
            />
            <MomentumArrow 
              momentum={marketData.trend === 'bull' ? 'up' : 'down'} 
              strength={marketData.trendStrength} 
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volatility</h3>
          <div className="flex items-center space-x-3">
            <VolatilityRangeBar 
              volatility={marketData.volatility} 
              high={marketData.high24h} 
              low={marketData.low24h} 
            />
            <VolatilityFireworks 
              volatility={marketData.volatility} 
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volume</h3>
          <div className="flex items-center space-x-3">
            <VolumeSurgeSpike 
              volume={marketData.volume24h} 
              averageVolume={10000000} 
              timeframe={selectedTimeframe} 
            />
            <WhaleTailIcon 
              whaleActivity={marketData.whaleActivity} 
              transactionSize={marketData.whaleTransactionSize} 
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Market</h3>
          <div className="flex items-center space-x-3">
            <OrderBookImbalanceTag 
              buyPercentage={marketData.orderBookImbalance * 100} 
            />
            <CorrelationHeatDot 
              correlation={marketData.correlationWithBTC} 
              symbol={selectedSymbol}
              referenceSymbol="BTC" 
            />
            <SentimentPulseDot 
              sentiment={marketData.sentimentScore} 
              source="Social Media"
            />
          </div>
        </div>
      </div>
      
      {/* Trading tools section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trading Signals</h3>
          <div className="flex flex-col space-y-3">
            <LiveTradeSignalBeam 
              signal={marketData.trend === 'bull' ? 'buy' : 'sell'} 
              strength={marketData.trendStrength} 
              source="AI Prediction" 
            />
            <MicroRSIBar 
              value={marketData.rsi} 
            />
            <PriceVelocityTicker 
              velocity={marketData.priceChange24h > 0 ? 0.05 : -0.03} 
              symbol={selectedSymbol} 
              timeframe={selectedTimeframe}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Analysis</h3>
          <div className="flex flex-col space-y-3">
            <PricePivotDot 
              price={marketData.price} 
              pivotPoints={marketData.pivotPoints} 
            />
            <VolatilityWaveform 
              volatilityHistory={[40, 45, 55, 65, 60, 70, 65, 75, 65, 60]} 
            />
            <TimeframeRewindSlider 
              currentBar={0} 
              maxBars={10} 
              timeframe={selectedTimeframe} 
            />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trading Tools</h3>
          <div className="flex flex-col space-y-3">
            <ScalpersProfitTarget 
              entry={profitTargets.entryPrice} 
              target={profitTargets.targetPrice} 
              stopLoss={profitTargets.stopLossPrice} 
              riskReward={profitTargets.riskRewardRatio}
            />
            <ScalpersStreakCounter 
              consecutiveWins={marketData.consecutiveWins} 
              consecutiveLosses={marketData.consecutiveLosses} 
              totalTrades={marketData.totalTrades} 
            />
            <div className="flex items-center justify-between">
              <CustomTriggerPin 
                symbol={selectedSymbol} 
                onSetAlert={handleSetAlert} 
              />
              <QuickTradeButton 
                symbol={selectedSymbol} 
                currentPrice={marketData.price} 
                onTrade={handleTrade} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Hot zone section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Traders Hot Zone</h3>
        <TradersHotZone 
          pairs={[
            { symbol: 'BTC/USDT', activity: 85 },
            { symbol: 'ETH/USDT', activity: 72 },
            { symbol: 'SOL/USDT', activity: 68 },
            { symbol: 'BNB/USDT', activity: 45 },
            { symbol: 'XRP/USDT', activity: 38 },
          ]} 
          selectedPair={selectedSymbol} 
          onSelectPair={setSelectedSymbol}
        />
      </div>
    </div>
  );
};

export default TradingDashboard;
