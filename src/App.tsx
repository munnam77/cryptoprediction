import React, { useState } from 'react';
import { Moon } from 'lucide-react';
import { DashboardLayout } from './layouts/DashboardLayout';
import TopPicks from './components/TopPicks';
import MarketMovers from './components/MarketMovers';
import PredictionEngine from './components/PredictionEngine';
import PredictionReveal from './components/PredictionReveal';

function App() {
  const [isRevealed, setIsRevealed] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardLayout>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Moon className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Aether-Crypto
            </h1>
          </div>
          <PredictionReveal onRevealComplete={() => setIsRevealed(true)} />
        </div>
        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-12 lg:col-span-8">
            <PredictionEngine isRevealed={isRevealed} />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <TopPicks />
            <MarketMovers />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}

export default App;