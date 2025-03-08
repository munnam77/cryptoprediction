import React, { ReactNode, useState, useEffect } from 'react';
import { Layers, Clock, RefreshCw, Settings, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Tooltip from '../components/ui/Tooltip';
import LiveMarketTracker from '../components/LiveMarketTracker';
import PredictionDashboard from '../components/PredictionDashboard';
import SentimentAnalysis from '../components/SentimentAnalysis';
import TimeframeSelector from '../components/TimeframeSelector';
import AlertSystem from '../components/AlertSystem';
import PredictionCard from '../components/PredictionCard';
import TechnicalAnalysis from '../components/TechnicalAnalysis';
import PredictionAccuracy from '../components/PredictionAccuracy';
import SystemMonitoring from '../components/SystemMonitoring';
import HistoricalAccuracy from '../components/HistoricalAccuracy';
import TopPicks from '../components/TopPicks';
import DataExport from '../components/DataExport';
import TestRunner from '../components/TestRunner';
import PredictionReveal from '../components/PredictionReveal';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // State for selected timeframe
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15m' | '30m' | '1h' | '4h' | '1d'>('1h');
  
  // State for selected symbol
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  
  // State for sidebar visibility on mobile
  const [showSidebar, setShowSidebar] = useState(false);
  
  // State for last data refresh
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // State for view mode (can be 'default', 'predictions', 'technical', 'monitoring')
  const [viewMode, setViewMode] = useState<string>('default');

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: '15m' | '30m' | '1h' | '4h' | '1d') => {
    setSelectedTimeframe(timeframe);
  };

  // Handle symbol selection
  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  // Handle manual data refresh
  const handleRefresh = () => {
    // The components with useBinanceData hook will refresh their data
    setLastRefresh(new Date());
    // This is just for UI indication, the actual refresh happens in the components
  };

  // Auto refresh every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastRefresh(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Responsive layout detection
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1280);
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1280);
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      {!isLargeScreen && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 p-3 rounded-full shadow-lg"
        >
          {showSidebar ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } transform lg:translate-x-0 transition-transform duration-300 lg:static fixed inset-y-0 left-0 z-40 w-64 xl:w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto`}
      >
        {/* Logo and App Name */}
        <div className="p-4 flex items-center space-x-2 border-b border-gray-700">
          <Layers className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-semibold">CryptoPrediction</h1>
        </div>
        
        {/* Symbol Overview */}
        {selectedSymbol && (
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-sm text-gray-400 mb-2">Selected Pair</h2>
            <div className="text-xl font-bold">{selectedSymbol}</div>
          </div>
        )}
        
        {/* Sidebar Components - Primary Analysis */}
        <div className="p-4 space-y-4">
          {selectedSymbol && (
            <PredictionCard
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
            />
          )}
          
          {selectedSymbol && (
            <SentimentAnalysis
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
            />
          )}
          
          <AlertSystem className="mt-4" />
          
          <TopPicks />
        </div>
        
        {/* Sidebar Components - Data Export & Testing */}
        <div className="mt-4 p-4 space-y-4 border-t border-gray-700">
          <DataExport />
          
          <TestRunner />
          
          {/* Bottom Info */}
          <div className="pt-4 text-xs text-gray-500 flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span>Last Updated:</span>
              <span>{lastRefresh.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Current Timeframe:</span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{selectedTimeframe}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Mode:</span>
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 py-3 px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            {/* Timeframe Selector */}
            <TimeframeSelector 
              selectedTimeframe={selectedTimeframe} 
              onChange={handleTimeframeChange} 
              variant="buttons"
            />
            
            {/* View Mode Selector */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                size="sm"
                variant={viewMode === 'default' ? 'primary' : 'outline'}
                onClick={() => setViewMode('default')}
              >
                Market
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'predictions' ? 'primary' : 'outline'}
                onClick={() => setViewMode('predictions')}
              >
                Predictions
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'technical' ? 'primary' : 'outline'}
                onClick={() => setViewMode('technical')}
              >
                Technical
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'monitoring' ? 'primary' : 'outline'}
                onClick={() => setViewMode('monitoring')}
              >
                System
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Last Refresh Info */}
            <div className="hidden md:flex items-center text-xs text-gray-400 mr-2">
              <Clock size={12} className="mr-1" />
              <span>Updated {Math.floor((Date.now() - lastRefresh.getTime()) / 1000)}s ago</span>
            </div>
            
            {/* Refresh Button */}
            <Tooltip content="Refresh market data">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mr-2"
              >
                <RefreshCw size={14} />
              </Button>
            </Tooltip>
            
            {/* Settings Button */}
            <Tooltip content="Dashboard settings">
              <Button
                size="sm"
                variant="outline"
              >
                <Settings size={14} />
              </Button>
            </Tooltip>
            
            {/* Info Button */}
            <Tooltip content="Dashboard information">
              <Button
                size="sm"
                variant="outline"
              >
                <Info size={14} />
              </Button>
            </Tooltip>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;