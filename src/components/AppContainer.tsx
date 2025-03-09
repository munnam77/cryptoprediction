import React, { useState, useEffect } from 'react';
import BinanceService from '../services/BinanceService';
import { useMarketData } from '../hooks/useMarketData';
import MainLayout from './MainLayout';
import DynamicBackgroundShift from './DynamicBackgroundShift';
import TopNavigationBar from './TopNavigationBar';
import type { MarketData } from '../types/binance';
import { AlertCircle, RefreshCw, Zap } from 'lucide-react';

const AppContainer: React.FC = () => {
  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    marketMood: true,
    initialPairs: true,
    marketData: true
  });
  
  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const [initialSymbols] = useState(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']); // Start with major pairs
  const [dataInitialized, setDataInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const MAX_RETRIES = 3;

  // Use our custom hook for real-time market data with progressive loading
  const { 
    marketData: allMarketData,
    isLoading: isMarketDataLoading,
    error: marketDataError,
    refresh: refreshMarketData
  } = useMarketData({
    symbols: initialSymbols,
    timeframe: marketState.selectedTimeframe,
  });

  // Derive top gainers and low cap gems from market data
  const topGainers = React.useMemo(() => {
    if (!allMarketData.length) return [];
    return [...allMarketData]
      .filter(data => data.priceChangePercent > 0)
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, 10);
  }, [allMarketData]);

  const lowCapGems = React.useMemo(() => {
    if (!allMarketData.length) return [];
    return [...allMarketData]
      .filter(data => {
        const volume = data.volume || 0;
        return volume > 0 && volume < 10000000;
      })
      .sort((a, b) => {
        const scoreA = (a.volatility || 0) * 0.4 + (a.priceChangePercent || 0) * 0.6;
        const scoreB = (b.volatility || 0) * 0.4 + (b.priceChangePercent || 0) * 0.6;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [allMarketData]);

  // Fetch market mood and update progressively
  useEffect(() => {
    let mounted = true;

    const updateMarketMood = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, marketMood: true }));
        const moodData = await BinanceService.getMarketMood();
        
        if (!mounted) return;
        
        setMarketState(prev => ({
          ...prev,
          sentiment: moodData.sentiment,
          volatility: moodData.volatility,
          marketChange: moodData.marketChangePercent,
          btcChangePercent: moodData.btcChangePercent
        }));
        
        setLoadingStates(prev => ({ ...prev, marketMood: false }));
        setErrors(prev => ({ ...prev, marketMood: '' }));
      } catch (error) {
        if (!mounted) return;
        console.error('Error updating market mood:', error);
        setErrors(prev => ({ 
          ...prev, 
          marketMood: 'Failed to update market sentiment' 
        }));
        setLoadingStates(prev => ({ ...prev, marketMood: false }));
        
        // Use default values if market mood fails
        setMarketState(prev => ({
          ...prev,
          sentiment: 50,
          volatility: 50,
          marketChange: 0,
          btcChangePercent: 0
        }));
      }
    };

    // Initial update
    updateMarketMood();

    // Update every 5 minutes
    const interval = setInterval(updateMarketMood, 300000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Progressive loading of additional pairs
  useEffect(() => {
    let mounted = true;

    const loadAdditionalPairs = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, initialPairs: true }));
        // Get top USDT pairs
        const pairs = await BinanceService.getUSDTPairs();
        if (!mounted) return;

        // Take top 50 pairs by volume
        const topPairs = pairs
          .slice(0, 50)
          .map(pair => pair.symbol)
          .filter(symbol => !initialSymbols.includes(symbol));

        // Update market data subscription with new symbols
        if (topPairs.length > 0) {
          refreshMarketData([...initialSymbols, ...topPairs]);
        }

        setLoadingStates(prev => ({ ...prev, initialPairs: false }));
        setErrors(prev => ({ ...prev, initialPairs: '' }));
      } catch (error) {
        if (!mounted) return;
        console.error('Error loading additional pairs:', error);
        setErrors(prev => ({
          ...prev,
          initialPairs: 'Failed to load additional trading pairs'
        }));
        setLoadingStates(prev => ({ ...prev, initialPairs: false }));
        
        // If we failed to load additional pairs, try to refresh with just the initial symbols
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            refreshMarketData(initialSymbols);
          }, 2000); // Wait 2 seconds before retrying
        }
      }
    };

    if (!dataInitialized) {
      loadAdditionalPairs();
      setDataInitialized(true);
    }

    return () => {
      mounted = false;
    };
  }, [initialSymbols, refreshMarketData, dataInitialized, retryCount]);

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

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMarketData([...initialSymbols]);
      // Wait at least 1 second to show the refresh animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshing(false);
    }
  };

  // Calculate overall loading state
  const isLoading = Object.values(loadingStates).some(state => state) && allMarketData.length === 0;

  // Show debug info
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

      {/* Debug Panel */}
      {debugMode && (
        <div className="fixed top-16 right-4 z-50 glass-effect text-white p-4 rounded-lg text-sm shadow-lg animate-slide-in-right">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Debug Mode</h3>
            <div className="px-2 py-0.5 bg-indigo-600 rounded-full text-xs">Active</div>
          </div>
          <div className="space-y-1">
            <p>Market Sentiment: {marketState.sentiment.toFixed(2)}</p>
            <p>Volatility: {marketState.volatility.toFixed(2)}</p>
            <p>BTC Change: {marketState.btcChangePercent.toFixed(2)}%</p>
            <p>Data Points: {allMarketData.length}</p>
          </div>
          
          <div className="mt-3 border-t border-gray-700 pt-2">
            <h4 className="text-xs text-gray-400 uppercase mb-1">Errors</h4>
            {Object.entries(errors).map(([key, error]) => 
              error ? <p key={key} className="text-red-400 text-xs">{error}</p> : null
            )}
          </div>
          
          <div className="mt-3 border-t border-gray-700 pt-2">
            <h4 className="text-xs text-gray-400 uppercase mb-1">Loading States</h4>
            {Object.entries(loadingStates).map(([key, loading]) => 
              <p key={key} className={`text-xs ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
                {key}: {loading ? 'Loading...' : 'Ready'}
              </p>
            )}
          </div>
          
          <button 
            className="mt-3 w-full bg-gray-700 hover:bg-gray-600 text-white py-1 rounded text-xs transition-colors"
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
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
        isLoading={isLoading}
        availableFeatures={availableFeatures}
      />
      
      {/* Refresh Button */}
      <button
        onClick={handleManualRefresh}
        disabled={refreshing}
        className="fixed bottom-4 left-4 z-50 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        title="Refresh data"
      >
        <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : ''}`} />
      </button>
      
      {/* Errors Toast */}
      {Object.values(errors).some(error => error) && !debugMode && (
        <div className="fixed bottom-4 right-4 z-50 glass-effect text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in-bottom">
          <div className="flex items-center">
            <AlertCircle size={18} className="text-red-400 mr-2" />
            <div>
              <p className="font-medium">Some features may be unavailable</p>
              <p className="text-sm mt-0.5 text-gray-300">Check your connection and refresh the page</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay - Only show for initial load */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <Zap size={20} className="text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-white text-center mb-2">Loading Market Data</h3>
            <p className="text-center text-gray-300 mb-4">Fetching real-time cryptocurrency data...</p>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full bg-shimmer" style={{ width: '60%' }}></div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              This may take a moment depending on your connection
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppContainer;
