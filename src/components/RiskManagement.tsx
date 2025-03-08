import React, { useState } from 'react';
import { Shield, DollarSign, Percent, AlertTriangle } from 'lucide-react';

interface RiskManagementProps {
  currentPrice: number;
  volatility: number;
  balance: number;
}

function RiskManagement({ currentPrice, volatility, balance }: RiskManagementProps) {
  const [riskPercentage, setRiskPercentage] = useState(1);
  const [stopLossPercent, setStopLossPercent] = useState(2);
  const [takeProfitPercent, setTakeProfitPercent] = useState(6);

  const calculatePositionSize = () => {
    const riskAmount = (balance * riskPercentage) / 100;
    const stopLossAmount = (currentPrice * stopLossPercent) / 100;
    return (riskAmount / stopLossAmount).toFixed(4);
  };

  const calculateLevels = () => {
    const stopLoss = currentPrice * (1 - stopLossPercent / 100);
    const takeProfit = currentPrice * (1 + takeProfitPercent / 100);
    return { stopLoss, takeProfit };
  };

  const { stopLoss, takeProfit } = calculateLevels();
  const positionSize = calculatePositionSize();
  const riskRewardRatio = takeProfitPercent / stopLossPercent;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-5 h-5 text-green-500" />
        <h2 className="text-xl font-semibold">Risk Management</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Risk Percentage
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={riskPercentage}
            onChange={(e) => setRiskPercentage(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm mt-1">
            <span>{riskPercentage}% of balance</span>
            <span>${((balance * riskPercentage) / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Stop Loss %
            </label>
            <input
              type="number"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Take Profit %
            </label>
            <input
              type="number"
              value={takeProfitPercent}
              onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Position Size</span>
            <span className="font-medium">{positionSize} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Stop Loss Level</span>
            <span className="font-medium text-red-500">${stopLoss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Take Profit Level</span>
            <span className="font-medium text-green-500">${takeProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Risk/Reward Ratio</span>
            <span className="font-medium">1:{riskRewardRatio.toFixed(1)}</span>
          </div>
        </div>

        {volatility > 3 && (
          <div className="flex items-center space-x-2 text-yellow-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">High volatility detected - consider reducing position size</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiskManagement;