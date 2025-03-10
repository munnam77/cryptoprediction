import React, { useState } from 'react';
import CryptoCard from './CryptoCard';
import CryptoDetailPanel from './CryptoDetailPanel';

// Define the cryptocurrency data structure
interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  sentiment: number;
  volatility: number;
  trendDirection: 'up' | 'down';
  trendStrength: number;
  logoUrl: string;
  description?: string;
}

interface CryptoGridProps {
  cryptos: CryptoData[];
  isLoading?: boolean;
}

/**
 * CryptoGrid Component
 * 
 * Displays a responsive grid of cryptocurrency cards
 * and handles the selection and display of detailed information
 */
const CryptoGrid: React.FC<CryptoGridProps> = ({ 
  cryptos, 
  isLoading = false 
}) => {
  // State to track the selected cryptocurrency
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);

  // Handle card click to show details
  const handleCardClick = (crypto: CryptoData) => {
    setSelectedCrypto(crypto);
  };

  // Handle closing the detail panel
  const handleCloseDetails = () => {
    setSelectedCrypto(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-800 rounded-lg p-4 h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (cryptos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No cryptocurrencies found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Grid of crypto cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cryptos.map((crypto) => (
          <CryptoCard
            key={crypto.id}
            name={crypto.name}
            symbol={crypto.symbol}
            price={crypto.price}
            change24h={crypto.change24h}
            trendDirection={crypto.trendDirection}
            trendStrength={crypto.trendStrength}
            logoUrl={crypto.logoUrl}
            onClick={() => handleCardClick(crypto)}
          />
        ))}
      </div>

      {/* Detail panel overlay */}
      {selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <CryptoDetailPanel
            name={selectedCrypto.name}
            symbol={selectedCrypto.symbol}
            price={selectedCrypto.price}
            change24h={selectedCrypto.change24h}
            change7d={selectedCrypto.change7d}
            marketCap={selectedCrypto.marketCap}
            volume24h={selectedCrypto.volume24h}
            circulatingSupply={selectedCrypto.circulatingSupply}
            sentiment={selectedCrypto.sentiment}
            volatility={selectedCrypto.volatility}
            logoUrl={selectedCrypto.logoUrl}
            description={selectedCrypto.description}
            onClose={handleCloseDetails}
          />
        </div>
      )}
    </div>
  );
};

export default CryptoGrid; 