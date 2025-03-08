import React, { useState, useEffect } from 'react';
import MainLayout from './MainLayout';
import DynamicBackgroundShift from './DynamicBackgroundShift';
import BinanceService from '../services/BinanceService';
import { MarketData } from '../services/BinanceService';
import mockData from '../data/mockMarketData';

/**
 * AppContainer - Main application container
 * Integrates all dashboard components and manages global state
 */
const AppContainer: React.FC = () => {
  // State for market data and metrics
  const [marketState, setMarketState] = useState({
    sentiment: 50, // 0-100
    volatility: 30, // 0-100
    marketChange: 0, // percentage
    btcChangePercent: 0,
    selectedTimeframe: '1h' as '15m' | '30m' | '1h' | '4h' | '1d'
  });
  
  // Initialize with mock data for immediate UI display
  const [topGainers, setTopGainers] = useState<MarketData[]>(mockData.topGainers);
  const [lowCapGems, setLowCapGems] = useState<MarketData[]>(mockData.lowCapGems);
  const [allMarketData, setAllMarketData] = useState<MarketData[]>(mockData.allMarketData);
  const [isLoading, setIsLoading] = useState(false); // Set to false initially
  const [error, setError] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);
  
  // Fetch initial market data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Don't show loading state on initial load since we have mock data
        
        // Get market mood
        const moodData = await BinanceService.getMarketMood();
        setMarketState({
          sentiment: moodData.sentiment,
          volatility: moodData.volatility,
          marketChange: moodData.marketChangePercent,
          btcChangePercent: moodData.btcChangePercent,
          selectedTimeframe: '1h'
        });
        
        // Get top gainers data
        const gainersData = await BinanceService.getTopGainers('1h', 10);
        if (gainersData.length > 0) {
          setTopGainers(gainersData);
        }
        
        // Get low-cap gems data
        const gemsData = await BinanceService.getLowCapGems('1h', 10);
        if (gemsData.length > 0) {
          setLowCapGems(gemsData);
        }
        
        // Get comprehensive market data
        const marketData = await BinanceService.getComprehensiveMarketData('1h');
        if (marketData.length > 0) {
          setAllMarketData(marketData);
        }
        
        setDataInitialized(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Don't show error if we have mock data already displaying
        // setError('Failed to load market data. Please try again later.');
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Refresh data periodically
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (!dataInitialized) return; // Don't refresh until initial real data is loaded
      
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
        
        // Update top gainers and low cap gems for the selected timeframe
        const gainersData = await BinanceService.getTopGainers(marketState.selectedTimeframe, 10);
        if (gainersData.length > 0) {
          setTopGainers(gainersData);
        }
        
        const gemsData = await BinanceService.getLowCapGems(marketState.selectedTimeframe, 10);
        if (gemsData.length > 0) {
          setLowCapGems(gemsData);
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
      // Only show loading state if we have real data already
      if (dataInitialized) {
        setIsLoading(true);
      }
      
      // Get data for the new timeframe
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
      // Don't show error if we have data already
      if (dataInitialized) {
        setError(`Failed to load data for ${timeframe} timeframe.`);
        setIsLoading(false);
      }
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
    <div className="min-h-screen">
      {/* Dynamic background based on market sentiment */}
      <DynamicBackgroundShift
        marketSentiment={marketState.sentiment}
        volatility={marketState.volatility}
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
