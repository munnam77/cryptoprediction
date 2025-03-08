import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface QuickTradeButtonProps {
  symbol: string;
  currentPrice: number;
  onTrade?: (trade: TradeDetails) => void;
  className?: string;
}

export interface TradeDetails {
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
}

/**
 * QuickTradeButton Component
 * One-click trading button with popup for quick entries
 */
const QuickTradeButton: React.FC<QuickTradeButtonProps> = ({
  symbol,
  currentPrice,
  onTrade,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeDetails, setTradeDetails] = useState<TradeDetails>({
    symbol,
    type: 'buy',
    price: currentPrice,
    amount: 0,
    stopLoss: undefined,
    takeProfit: undefined,
    leverage: 1
  });
  
  // Toggle trade panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  // Set trade type and update details
  const setType = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setTradeDetails(prev => ({
      ...prev,
      type
    }));
  };
  
  // Handle input change
  const handleChange = (field: keyof TradeDetails, value: any) => {
    setTradeDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Execute trade
  const executeTrade = () => {
    if (onTrade) {
      onTrade(tradeDetails);
    }
    setIsOpen(false);
  };
  
  // Format price based on magnitude
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${value.toFixed(2)}`;
    } else if (value >= 1) {
      return `$${value.toFixed(3)}`;
    } else if (value >= 0.01) {
      return `$${value.toFixed(4)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={togglePanel}
        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        title="Quick trade"
      >
        <span>Trade</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Quick Trade {symbol}
            </h3>
            <button
              onClick={togglePanel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Current price */}
          <div className="mb-3 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current price:</span>
            <span className="ml-2 text-lg font-medium">{formatPrice(currentPrice)}</span>
          </div>
          
          {/* Trade type selector */}
          <div className="flex mb-4">
            <button
              onClick={() => setType('buy')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-l-md ${
                tradeType === 'buy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Buy/Long</span>
            </button>
            <button
              onClick={() => setType('sell')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-r-md ${
                tradeType === 'sell'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Sell/Short</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                value={tradeDetails.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                min="0"
                step="10"
              />
            </div>
            
            {/* Leverage */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leverage
              </label>
              <select
                value={tradeDetails.leverage}
                onChange={(e) => handleChange('leverage', parseInt(e.target.value, 10))}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              >
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
                <option value={20}>20x</option>
                <option value={50}>50x</option>
                <option value={100}>100x</option>
              </select>
            </div>
            
            {/* Stop Loss */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stop Loss (optional)
              </label>
              <input
                type="number"
                value={tradeDetails.stopLoss || ''}
                onChange={(e) => handleChange('stopLoss', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder={tradeType === 'buy' ? `Below ${formatPrice(currentPrice * 0.95)}` : `Above ${formatPrice(currentPrice * 1.05)}`}
                step={currentPrice < 1 ? 0.0001 : 0.01}
              />
            </div>
            
            {/* Take Profit */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Take Profit (optional)
              </label>
              <input
                type="number"
                value={tradeDetails.takeProfit || ''}
                onChange={(e) => handleChange('takeProfit', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder={tradeType === 'buy' ? `Above ${formatPrice(currentPrice * 1.05)}` : `Below ${formatPrice(currentPrice * 0.95)}`}
                step={currentPrice < 1 ? 0.0001 : 0.01}
              />
            </div>
            
            {/* Execute Button */}
            <button
              onClick={executeTrade}
              disabled={tradeDetails.amount <= 0}
              className={`w-full mt-2 py-2 rounded-md text-white font-medium ${
                tradeType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${tradeDetails.amount <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickTradeButton;
