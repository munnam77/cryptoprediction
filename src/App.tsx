import { useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import TopPicks from './components/TopPicks';
import MarketMovers from './components/MarketMovers';
import PredictionEngine from './components/PredictionEngine';
import PredictionReveal from './components/PredictionReveal';
import TradingDashboard from './components/TradingDashboard';
import AppContainer from './components/AppContainer';
import MainLayout from './components/MainLayout';
import TopNavigationBar from './components/TopNavigationBar';
import TopPicksCarousel from './components/TopPicksCarousel';
import TopGainersCarousel from './components/TopGainersCarousel';
import DynamicBackgroundShift from './components/DynamicBackgroundShift';

function App() {
  const [isRevealed, setIsRevealed] = useState(true);
  const [activeTab, setActiveTab] = useState<'prediction' | 'trading' | 'dashboard'>('dashboard');

  if (activeTab === 'dashboard') {
    return <AppContainer />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardLayout>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <img src="/aether-logo.svg" alt="Aether Crypto" className="w-8 h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Aether Crypto
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                New Dashboard
              </button>
              <button
                onClick={() => setActiveTab('prediction')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'prediction'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Prediction Engine
              </button>
              <button
                onClick={() => setActiveTab('trading')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'trading'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Trading Dashboard
              </button>
            </div>
            {activeTab === 'prediction' && (
              <PredictionReveal onRevealComplete={() => setIsRevealed(true)} />
            )}
          </div>
        </div>

        <main className="flex-1 p-6">
          {activeTab === 'prediction' && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="xl:col-span-2">
                  <TopPicks />
                </div>
                <div>
                  <MarketMovers />
                </div>
              </div>
              <div>
                <PredictionEngine isRevealed={isRevealed} />
              </div>
            </>
          )}

          {activeTab === 'trading' && <TradingDashboard />}
        </main>
      </DashboardLayout>
    </div>
  );
}

export default App;