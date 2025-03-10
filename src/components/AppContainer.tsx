import React, { useState, useEffect } from 'react';
import BinanceService from '../services/BinanceService';
import { useMarketData } from '../hooks/useMarketData';
import MainLayout from './MainLayout';
import DynamicBackgroundShift from './DynamicBackgroundShift';
import TopNavigationBar from './TopNavigationBar';
import type { MarketData, TimeFrame } from '../types/binance';
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
  const [availableFeatures, setAvailableFeatures] = useState({
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
    selectedTimeframe: '1h' as TimeFrame
  });

  const [debugMode, setDebugMode] = useState(false);
  const [initialSymbols] = useState(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']); // Start with major pairs
  const [dataInitialized, setDataInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [appReady, setAppReady] = useState(false);
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

  // Add a timeframe change handler with better visual feedback
  const handleTimeframeChange = (timeframe: TimeFrame) => {
    // Log the timeframe change
    console.log(`Changing timeframe from ${marketState.selectedTimeframe} to ${timeframe}`);
    
    // Show a loading state during timeframe change
    setRefreshing(true);
    
    // Update the market state with the new timeframe
    setMarketState(prev => ({
      ...prev,
      selectedTimeframe: timeframe
    }));
    
    // Refresh the market data with the new timeframe
    refreshMarketData([...initialSymbols])
      .then(() => {
        // Wait a moment to show the loading animation
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
      })
      .catch(error => {
        console.error('Error refreshing data after timeframe change:', error);
        setRefreshing(false);
      });
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

  // Set app ready state after initial loading
  useEffect(() => {
    if (!isLoading && !isMarketDataLoading && allMarketData.length > 0) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isMarketDataLoading, allMarketData]);

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
        <div className="fixed top-16 right-4 z-50 glass-panel text-white p-4 rounded-lg text-sm shadow-lg animate-slide-in-right">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Debug Mode</h3>
            <div className="px-2 py-0.5 bg-indigo-600 rounded-full text-xs">Active</div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-400">Market Data Status:</div>
              <div className={`text-sm ${marketDataError ? 'text-red-400' : 'text-green-400'}`}>
                {marketDataError ? 'Error' : 'OK'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Loaded Pairs:</div>
              <div className="text-sm">{allMarketData.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Selected Timeframe:</div>
              <div className="text-sm">{marketState.selectedTimeframe}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Top Gainers:</div>
              <div className="text-sm">{topGainers.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Low Cap Gems:</div>
              <div className="text-sm">{lowCapGems.length}</div>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-full mt-2 flex items-center justify-center px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-sm transition-colors duration-200"
            >
              {refreshing ? (
                <>
                  <RefreshCw size={14} className="mr-1 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="mr-1" />
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}>
        <MainLayout
          selectedTimeframe={marketState.selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
          topGainers={topGainers}
          lowCapGems={lowCapGems}
          allMarketData={allMarketData}
          isLoading={isLoading || isMarketDataLoading}
          marketSentiment={marketState.sentiment}
          marketVolatility={marketState.volatility}
          btcChangePercent={marketState.btcChangePercent}
          marketChangePercent={marketState.marketChange}
          availableFeatures={availableFeatures}
        />
      </div>
      
      {/* Initial Loading Screen */}
      {!appReady && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={32} className="text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 gradient-text">CryptoPrediction</h2>
          <p className="text-gray-400 mb-6">Loading market data...</p>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse-slow"
              style={{ width: `${Math.min(100, allMarketData.length * 2)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {allMarketData.length > 0 ? `Loaded ${allMarketData.length} pairs` : 'Connecting to market...'}
          </div>
          
          {/* Error Messages */}
          {Object.entries(errors).map(([key, error]) => 
            error ? (
              <div key={key} className="mt-4 flex items-center text-red-400 text-sm">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default AppContainer;
