import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import PriceChangeIndicator from './PriceChangeIndicator';
import MarketMoodOrb from './MarketMoodOrb';

interface CryptoDetailPanelProps {
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
  logoUrl: string;
  description?: string;
  onClose: () => void;
}

/**
 * CryptoDetailPanel Component
 * 
 * Displays detailed information about a selected cryptocurrency:
 * - Basic info (name, symbol, price)
 * - Price changes (24h, 7d)
 * - Market data (market cap, volume, supply)
 * - Market mood visualization
 * - Description
 */
const CryptoDetailPanel: React.FC<CryptoDetailPanelProps> = ({
  name,
  symbol,
  price,
  change24h,
  change7d,
  marketCap,
  volume24h,
  circulatingSupply,
  sentiment,
  volatility,
  logoUrl,
  description,
  onClose
}) => {
  // Format large numbers with appropriate suffixes (K, M, B, T)
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-xl w-full max-w-2xl">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img 
            src={logoUrl} 
            alt={`${name} logo`} 
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">{name}</h2>
            <p className="text-gray-400">{symbol}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close panel"
        >
          <X size={24} />
        </button>
      </div>

      {/* Price and changes */}
      <div className="mb-8">
        <div className="flex items-baseline mb-4">
          <h3 className="text-3xl font-bold text-white mr-3">
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <PriceChangeIndicator value={change24h} className="text-lg" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">24h Change</p>
            <PriceChangeIndicator value={change24h} />
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">7d Change</p>
            <PriceChangeIndicator value={change7d} />
          </div>
        </div>
      </div>

      {/* Market data */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Market Cap</p>
          <p className="text-white font-semibold">${formatLargeNumber(marketCap)}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">24h Volume</p>
          <p className="text-white font-semibold">${formatLargeNumber(volume24h)}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-sm mb-1">Circulating Supply</p>
          <p className="text-white font-semibold">{formatLargeNumber(circulatingSupply)} {symbol}</p>
        </div>
      </div>

      {/* Market mood */}
      <div className="mb-8">
        <h3 className="text-white font-semibold mb-3">Market Mood</h3>
        <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center">
          <MarketMoodOrb sentiment={sentiment} volatility={volatility} />
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-2">About {name}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {description.length > 300 
              ? `${description.substring(0, 300)}...` 
              : description
            }
          </p>
        </div>
      )}

      {/* External link */}
      <div className="text-center">
        <a 
          href={`https://www.coingecko.com/en/coins/${name.toLowerCase().replace(/\s+/g, '-')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
        >
          View on CoinGecko
          <ExternalLink size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );
};

export default CryptoDetailPanel; 