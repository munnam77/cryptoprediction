import React, { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import DynamicBackgroundShift from './DynamicBackgroundShift';
import TopNavigationBar from './TopNavigationBar';
import BinanceService from '../services/BinanceService';
import { MarketData } from '../services/BinanceService';

const AppContainer: React.FC = () => {
  // Market state
  const [marketState, setMarketState] = useState({
    sentiment: 65, // 0-100
    volatility: 45, // 0-100
    marketChange: 2.5, // percentage
    btcChangePercent: 1.2,
    selectedTimeframe: '1h' as '15m' | '30m' | '1h' | '4h' | '1d'
  });

  // Data states
  const [topGainers, setTopGainers] = useState<MarketData[]>([]);
  const [lowCapGems, setLowCapGems] = useState<MarketData[]>([]);
  const [allMarketData, setAllMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Initial data load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get market mood data
        const moodData = await BinanceService.getMarketMood();
        setMarketState(prev => ({
          ...prev,
          sentiment: moodData.sentiment,
          volatility: moodData.volatility,
          marketChange: moodData.marketChangePercent,
          btcChangePercent: moodData.btcChangePercent
        }));

        // Get initial data for all sections
        const gainersData = await BinanceService.getTopGainers('1h', 10);
        if (gainersData.length > 0) {
          setTopGainers(gainersData);
        }

        const gemsData = await BinanceService.getLowCapGems('1h', 10);
        if (gemsData.length > 0) {
          setLowCapGems(gemsData);
        }

        const marketData = await BinanceService.getComprehensiveMarketData('1h');
        if (marketData.length > 0) {
          setAllMarketData(marketData);
        }

        setDataInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load market data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Refresh data periodically
  useEffect(() => {
    if (!dataInitialized) return;

    const refreshInterval = setInterval(async () => {
      try {
        // Update market mood
        const moodData = await BinanceService.getMarketMood();
        setMarketState(prev => ({
          ...prev,
          sentiment: moodData.sentiment,
          volatility: moodData.volatility,
          marketChange: moodData.marketChangePercent,
          btcChangePercent: moodData.btcChangePercent
        }));

        // Update all data sections
        const gainersData = await BinanceService.getTopGainers(marketState.selectedTimeframe, 10);
        if (gainersData.length > 0) {
          setTopGainers(gainersData);
        }

        const gemsData = await BinanceService.getLowCapGems(marketState.selectedTimeframe, 10);
        if (gemsData.length > 0) {
          setLowCapGems(gemsData);
        }

        const marketData = await BinanceService.getComprehensiveMarketData(marketState.selectedTimeframe);
        if (marketData.length > 0) {
          setAllMarketData(marketData);
        }

      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, [marketState.selectedTimeframe, dataInitialized]);

  // Handle timeframe change
  const handleTimeframeChange = async (timeframe: '15m' | '30m' | '1h' | '4h' | '1d') => {
    setMarketState(prev => ({
      ...prev,
      selectedTimeframe: timeframe
    }));

    try {
      setIsLoading(true);

      const gainersData = await BinanceService.getTopGainers(timeframe, 10);
      if (gainersData.length > 0) {
        setTopGainers(gainersData);
      }

      const gemsData = await BinanceService.getLowCapGems(timeframe, 10);
      if (gemsData.length > 0) {
        setLowCapGems(gemsData);
      }

      const marketData = await BinanceService.getComprehensiveMarketData(timeframe);
      if (marketData.length > 0) {
        setAllMarketData(marketData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(`Error fetching data for timeframe ${timeframe}:`, error);
      setError(`Failed to load data for ${timeframe} timeframe.`);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Dynamic background based on market sentiment */}
      <DynamicBackgroundShift
        marketSentiment={marketState.sentiment}
        volatility={marketState.volatility}
      />

      {/* Top Navigation */}
      <TopNavigationBar
        marketSentiment={marketState.sentiment}
        btcChangePercent={marketState.btcChangePercent}
        marketChangePercent={marketState.marketChange}
      />

      {/* Main layout with all panels */}
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
        isLoading={isLoading}
      />
    </div>
  );
};

export default AppContainer;
