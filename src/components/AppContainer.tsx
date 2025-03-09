import React, { useState, useEffect } from 'react';
import BinanceService from '../services/BinanceService';
import { useMarketData } from '../hooks/useMarketData';
import MainLayout from './MainLayout';
import DynamicBackgroundShift from './DynamicBackgroundShift';
import TopNavigationBar from './TopNavigationBar';
import type { MarketData } from '../types/binance';

const AppContainer: React.FC = () => {
  // Feature detection state
  const [availableFeatures, _setAvailableFeatures] = useState({
    marketData: true,
    predictions: true,
    topGainers: true,
    lowCapGems: true,
    alerts: true
  });

  // Market state
  const [marketState, setMarketState] = useState({
    sentiment: 50,
    volatility: 0,
    marketChange: 0,
    btcChangePercent: 0,
    selectedTimeframe: '1h' as '15m' | '30m' | '1h' | '4h' | '1d'
  });

  const [debugMode, setDebugMode] = useState(false);

  // Use our custom hook for real-time market data
  const { 
    marketData: allMarketData,
    isLoading: isMarketDataLoading,
    error: marketDataError
  } = useMarketData({
    symbols: ['BTCUSDT'], // Initial symbol, will be updated with more
    timeframe: marketState.selectedTimeframe,
  });

  // Derive top gainers and low cap gems from market data
  const topGainers = React.useMemo(() => {
    return allMarketData
      .filter(data => data.priceChangePercent > 0)
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 10);
  }, [allMarketData]);

  const lowCapGems = React.useMemo(() => {
    return allMarketData
      .filter(data => {
        const volume = data.volume || 0;
        return volume > 0 && volume < 10000000; // Filter for low volume as proxy for low market cap
      })
      .sort((a, b) => {
        const scoreA = (a.volatility || 0) * 0.4 + (a.priceChangePercent || 0) * 0.6;
        const scoreB = (b.volatility || 0) * 0.4 + (b.priceChangePercent || 0) * 0.6;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [allMarketData]);

  // Fetch and update market mood periodically
  useEffect(() => {
    const updateMarketMood = async () => {
      try {
        const moodData = await BinanceService.getMarketMood();
        setMarketState(prev => ({
          ...prev,
          sentiment: moodData.sentiment,
          volatility: moodData.volatility,
          marketChange: moodData.marketChangePercent,
          btcChangePercent: moodData.btcChangePercent
        }));
      } catch (error) {
        console.error('Error updating market mood:', error);
      }
    };

    // Initial update
    updateMarketMood();

    // Update every 5 minutes
    const interval = setInterval(updateMarketMood, 300000);
    return () => clearInterval(interval);
  }, []);

  // Debug mode keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        setDebugMode(!debugMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: '15m' | '30m' | '1h' | '4h' | '1d') => {
    setMarketState(prev => ({
      ...prev,
      selectedTimeframe: timeframe
    }));
  };

  // Show any errors in debug mode
  useEffect(() => {
    if (marketDataError && debugMode) {
      console.error('Market data error:', marketDataError);
    }
  }, [marketDataError, debugMode]);

  return (
    <div className="min-h-screen relative">
      <DynamicBackgroundShift
        marketSentiment={marketState.sentiment}
        volatility={marketState.volatility}
      />
      
      <TopNavigationBar
        marketSentiment={marketState.sentiment}
        btcChangePercent={marketState.btcChangePercent}
        marketChangePercent={marketState.marketChange}
      />

      {debugMode && (
        <div className="fixed top-16 right-4 z-50 bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg text-sm">
          <p>Debug Mode Active</p>
          <p>Market Sentiment: {marketState.sentiment.toFixed(2)}</p>
          <p>Volatility: {marketState.volatility.toFixed(2)}</p>
          <p>BTC Change: {marketState.btcChangePercent.toFixed(2)}%</p>
          <p>Data Points: {allMarketData.length}</p>
          {marketDataError && <p className="text-red-400">Error: {marketDataError}</p>}
        </div>
      )}

      <MainLayout 
        marketSentiment={marketState.sentiment}
        marketVolatility={marketState.volatility}
        btcChangePercent={marketState.btcChangePercent}
        marketChangePercent={marketState.marketChange}
        selectedTimeframe={marketState.selectedTimeframe}
        onTimeframeChange={handleTimeframeChange}
        topGainers={topGainers}
        lowCapGems={lowCapGems}
        allMarketData={allMarketData}
        isLoading={isMarketDataLoading}
        availableFeatures={availableFeatures}
      />
    </div>
  );
};

export default AppContainer;
