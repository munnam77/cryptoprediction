import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import DataRefreshService from '../services/DataRefreshService';
import LoggingService from '../services/LoggingService';
import RefreshProgressBar from './RefreshProgressBar';
import TimeframeSelector from './TimeframeSelector';
import PredictionDashboard from './PredictionDashboard';
import TopPicksSection from './TopPicksSection';
import TradingPairTable from './TradingPairTable';
import MarketMoodOrb from './MarketMoodOrb';
import BTCRippleLine from './BTCRippleLine';
import MarketMovers from './MarketMovers';
import TechnicalAnalysisPanel from './TechnicalAnalysisPanel';
import SearchBar from './SearchBar';
import FilterTabs, { FilterTab } from './FilterTabs';
import SortDropdown, { SortOption } from './SortDropdown';
import CryptoGrid from './CryptoGrid';
import type { MarketData, TimeFrame } from '../types/binance';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Star, 
  Activity, 
  LineChart, 
  Settings, 
  Bell, 
  Search,
  Info,
  RefreshCw
} from 'lucide-react';

/**
 * MainDashboard Component
 * 
 * The central hub for the crypto prediction application, integrating all major features:
 * - Prediction Engine with multi-timeframe support
 * - Top Picks section with low-cap gems
 * - Trading Pair Table with comprehensive market data
 * - Market Movers section with top gainers/losers
 * - Technical Analysis tools
 */
const MainDashboard: React.FC = () => {
  // Theme state
  const { theme, toggleTheme } = useTheme();
  
  // Timeframe state
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1h');
  
  // Market data state
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [topGainers, setTopGainers] = useState<MarketData[]>([]);
  const [lowCapGems, setLowCapGems] = useState<MarketData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePairsCount, setActivePairsCount] = useState<number>(0);
  
  // Market sentiment data
  const [marketSentiment, setMarketSentiment] = useState<number>(65);
  const [marketVolatility, setMarketVolatility] = useState<number>(45);
  const [btcChangePercent, setBtcChangePercent] = useState<number>(0);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'analysis' | 'explore'>('overview');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter tabs configuration
  const filterTabs: FilterTab[] = [
    { id: 'all', label: 'All Coins', count: marketData.length },
    { id: 'trending', label: 'Trending', count: 12 },
    { id: 'watchlist', label: 'Watchlist', count: 5 },
    { id: 'gainers', label: 'Top Gainers', count: topGainers.length },
    { id: 'losers', label: 'Top Losers', count: 10 },
  ];
  
  // Sort options configuration
  const sortOptions: SortOption[] = [
    { id: 'marketCap', label: 'Market Cap' },
    { id: 'price', label: 'Price' },
    { id: 'change24h', label: '24h Change' },
    { id: 'volume', label: 'Volume' },
  ];
  
  // Initialize data service
  useEffect(() => {
    const dataService = DataRefreshService.getInstance();
    
    // Subscribe to market data updates
    const marketDataSubscription = dataService.marketData$.subscribe(data => {
      setMarketData(data);
      setActivePairsCount(data.length);
      setIsLoading(false);
      
      // Find BTC data to update BTC change percent
      const btcData = data.find(item => item.symbol === 'BTCUSDT');
      if (btcData) {
        setBtcChangePercent(btcData.priceChangePercent);
      }
      
      // Calculate market sentiment based on top 20 coins
      const top20 = data.slice(0, 20);
      const avgSentiment = top20.reduce((sum, coin) => {
        return sum + (coin.priceChangePercent > 0 ? 1 : -1);
      }, 0);
      
      // Convert to 0-100 scale
      const normalizedSentiment = Math.min(100, Math.max(0, 50 + (avgSentiment / 20) * 50));
      setMarketSentiment(normalizedSentiment);
      
      // Calculate market volatility based on top 20 coins
      const avgVolatility = top20.reduce((sum, coin) => sum + (coin.volatility || 0), 0) / 20;
      setMarketVolatility(avgVolatility);
    });
    
    // Subscribe to top gainers updates
    const topGainersSubscription = dataService.topGainers$.subscribe(data => {
      setTopGainers(data);
    });
    
    // Subscribe to low cap gems updates
    const lowCapGemsSubscription = dataService.lowCapGems$.subscribe(data => {
      setLowCapGems(data);
    });
    
    // Start the data service with the selected timeframe
    dataService.start(selectedTimeframe);
    
    // Log dashboard initialization
    LoggingService.info('Dashboard initialized', { timeframe: selectedTimeframe });
    
    // Clean up subscriptions on unmount
    return () => {
      marketDataSubscription.unsubscribe();
      topGainersSubscription.unsubscribe();
      lowCapGemsSubscription.unsubscribe();
      dataService.stop();
    };
  }, []);
  
  // Handle timeframe change
  const handleTimeframeChange = (timeframe: TimeFrame) => {
    setSelectedTimeframe(timeframe);
    
    // Update data service with new timeframe
    const dataService = DataRefreshService.getInstance();
    dataService.changeTimeframe(timeframe);
    
    LoggingService.info('Timeframe changed', { timeframe });
  };
  
  // Handle coin selection
  const handleCoinSelect = (coin: MarketData) => {
    setSelectedCoin(coin);
    LoggingService.debug('Coin selected', { symbol: coin.symbol });
  };
  
  // Force data refresh
  const handleForceRefresh = () => {
    const dataService = DataRefreshService.getInstance();
    dataService.forceRefresh();
    LoggingService.info('Manual refresh triggered');
  };
  
  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    LoggingService.debug('Search query changed', { query });
  };
  
  // Handle filter tab change
  const handleFilterTabChange = (tabId: string) => {
    setActiveFilterTab(tabId);
    LoggingService.debug('Filter tab changed', { tabId });
  };
  
  // Handle sort option change
  const handleSort = (optionId: string, direction: 'asc' | 'desc') => {
    setSortOption(optionId);
    setSortDirection(direction);
    LoggingService.debug('Sort changed', { option: optionId, direction });
  };
  
  // Filter and sort market data based on current filters
  const getFilteredAndSortedData = () => {
    // First filter by search query
    let filteredData = marketData.filter(coin => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        coin.symbol.toLowerCase().includes(query) ||
        coin.name.toLowerCase().includes(query)
      );
    });
    
    // Then filter by tab
    if (activeFilterTab === 'trending') {
      filteredData = filteredData.filter(coin => coin.trending);
    } else if (activeFilterTab === 'watchlist') {
      filteredData = filteredData.filter(coin => coin.watchlist);
    } else if (activeFilterTab === 'gainers') {
      filteredData = [...topGainers];
    } else if (activeFilterTab === 'losers') {
      filteredData = filteredData
        .filter(coin => coin.priceChangePercent < 0)
        .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
        .slice(0, 10);
    }
    
    // Finally sort by selected option
    return filteredData.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortOption) {
        case 'marketCap':
          valueA = a.marketCap;
          valueB = b.marketCap;
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'change24h':
          valueA = a.priceChangePercent;
          valueB = b.priceChangePercent;
          break;
        case 'volume':
          valueA = a.volume;
          valueB = b.volume;
          break;
        default:
          valueA = a.marketCap;
          valueB = b.marketCap;
      }
      
      return sortDirection === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    });
  };
  
  // Convert MarketData to CryptoData format for CryptoGrid
  const convertToCryptoData = (data: MarketData[]) => {
    return data.map(coin => ({
      id: coin.symbol,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.price,
      change24h: coin.priceChangePercent,
      change7d: coin.priceChangePercent7d || 0,
      marketCap: coin.marketCap,
      volume24h: coin.volume,
      circulatingSupply: coin.circulatingSupply || 0,
      sentiment: coin.sentiment || 50,
      volatility: coin.volatility || 30,
      trendDirection: coin.priceChangePercent >= 0 ? 'up' as const : 'down' as const,
      trendStrength: Math.min(3, Math.max(1, Math.ceil(Math.abs(coin.priceChangePercent) / 5))),
      logoUrl: `https://cryptologos.cc/logos/${coin.name.toLowerCase().replace(/\s+/g, '-')}-${coin.symbol.toLowerCase()}-logo.png?v=023`,
      description: coin.description
    }));
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme === 'dark' ? 'from-gray-900 to-black' : 'from-gray-100 to-white'} text-${theme === 'dark' ? 'white' : 'gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-opacity-80 backdrop-blur-lg bg-crypto-dark">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-crypto-glow">
                  <LineChart className="h-5 w-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold">Aether-Crypto</h1>
              </div>
              
              {/* BTC Ripple Line */}
              <div className="hidden md:block w-48">
                <BTCRippleLine changePercent={btcChangePercent} />
              </div>
              
              {/* Active pairs counter */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">
                  {isLoading ? 'Loading...' : `${activePairsCount} Active Pairs`}
                </span>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Market Mood Orb */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-400">Market Sentiment:</span>
                <MarketMoodOrb sentiment={marketSentiment} volatility={marketVolatility} />
              </div>
              
              {/* Timeframe selector */}
              <TimeframeSelector 
                selectedTimeframe={selectedTimeframe}
                onChange={handleTimeframeChange}
              />
              
              {/* Refresh progress */}
              <div className="w-32 hidden md:block">
                <RefreshProgressBar />
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex items-center space-x-1 mt-4">
            <button
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-50'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Market Overview</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === 'predictions' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-50'
              }`}
              onClick={() => setActiveTab('predictions')}
            >
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Predictions</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === 'analysis' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-50'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Technical Analysis</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === 'explore' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-50'
              }`}
              onClick={() => setActiveTab('explore')}
            >
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Explore</span>
              </div>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top section: Top Picks and Market Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Picks Section */}
              <div className="lg:col-span-2">
                <TopPicksSection 
                  lowCapGems={lowCapGems}
                  timeframe={selectedTimeframe}
                  onCoinSelect={handleCoinSelect}
                  isLoading={isLoading}
                />
              </div>
              
              {/* Market Movers */}
              <div>
                <MarketMovers 
                  topGainers={topGainers}
                  timeframe={selectedTimeframe}
                  onCoinSelect={handleCoinSelect}
                  isLoading={isLoading}
                />
              </div>
            </div>
            
            {/* Trading Pair Table */}
            <div className="bg-crypto-dark rounded-xl shadow-crypto-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    Market Overview
                  </h2>
                  
                  {/* Search and filters */}
                  <div className="flex items-center space-x-3">
                    <div className="relative w-48">
                      <SearchBar 
                        onSearch={handleSearch}
                        placeholder="Search coins..."
                      />
                    </div>
                    
                    <button 
                      className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                      onClick={handleForceRefresh}
                      title="Refresh data"
                    >
                      <RefreshCw className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              
              <TradingPairTable 
                marketData={marketData}
                timeframe={selectedTimeframe}
                onCoinSelect={handleCoinSelect}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
        
        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <PredictionDashboard 
              timeframe={selectedTimeframe}
              predictedGainers={lowCapGems}
              actualGainers={topGainers}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {/* Technical Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <TechnicalAnalysisPanel 
              selectedCoin={selectedCoin}
              timeframe={selectedTimeframe}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Search and filter controls */}
            <div className="bg-crypto-dark rounded-xl p-4 shadow-crypto-lg">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                {/* Search bar */}
                <div className="flex-grow">
                  <SearchBar 
                    onSearch={handleSearch}
                    placeholder="Search by name or symbol..."
                    className="w-full"
                  />
                </div>
                
                {/* Sort dropdown */}
                <div className="w-48">
                  <SortDropdown 
                    options={sortOptions}
                    defaultOption="marketCap"
                    onSort={handleSort}
                  />
                </div>
                
                {/* Refresh button */}
                <button 
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center"
                  onClick={handleForceRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
              
              {/* Filter tabs */}
              <div className="mt-4">
                <FilterTabs 
                  tabs={filterTabs}
                  activeTab={activeFilterTab}
                  onTabChange={handleFilterTabChange}
                />
              </div>
            </div>
            
            {/* Crypto grid */}
            <CryptoGrid 
              cryptos={convertToCryptoData(getFilteredAndSortedData())}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6 bg-crypto-dark bg-opacity-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2023 Aether-Crypto. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainDashboard; 