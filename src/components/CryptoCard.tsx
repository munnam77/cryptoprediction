import React from 'react';
import PriceChangeIndicator from './PriceChangeIndicator';
import TrendStrengthIcon from './TrendStrengthIcon';

interface CryptoCardProps {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  trendDirection: 'up' | 'down';
  trendStrength: number;
  logoUrl: string;
  onClick?: () => void;
}

/**
 * CryptoCard Component
 * 
 * Displays cryptocurrency information in a card format:
 * - Logo
 * - Name and symbol
 * - Current price
 * - 24h price change
 * - Trend direction and strength
 */
const CryptoCard: React.FC<CryptoCardProps> = ({
  name,
  symbol,
  price,
  change24h,
  trendDirection,
  trendStrength,
  logoUrl,
  onClick
}) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 mr-3 overflow-hidden">
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-white font-semibold">{name}</h3>
          <p className="text-gray-400 text-sm">{symbol}</p>
        </div>
        <div className="ml-auto">
          <TrendStrengthIcon 
            direction={trendDirection} 
            strength={trendStrength} 
          />
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-gray-400 text-xs mb-1">Price</p>
          <p className="text-white font-bold text-xl">
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs mb-1">24h Change</p>
          <PriceChangeIndicator value={change24h} />
        </div>
      </div>
    </div>
  );
};

export default CryptoCard; 