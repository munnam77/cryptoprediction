import React from 'react';
import { BarChart2, TrendingUp, Activity, PieChart } from 'lucide-react';

interface AnalyticsData {
  accuracy: {
    overall: number;
    byTimeframe: Record<string, number>;
  };
  performance: {
    winRate: number;
    avgGain: number;
    avgLoss: number;
    profitFactor: number;
  };
  predictions: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { accuracy, performance, predictions } = data;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart2 className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Overall Accuracy</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-2">{accuracy.overall}%</div>
          <div className="space-y-2">
            {Object.entries(accuracy.byTimeframe).map(([timeframe, acc]) => (
              <div key={timeframe} className="flex justify-between text-sm">
                <span className="text-gray-400">{timeframe}</span>
                <span>{acc}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Performance Metrics</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Win Rate</span>
              <span className="font-medium">{performance.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Gain</span>
              <span className="text-green-500">+{performance.avgGain}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Loss</span>
              <span className="text-red-500">{performance.avgLoss}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Factor</span>
              <span className="font-medium">{performance.profitFactor}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Prediction Stats</span>
            <PieChart className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold mb-2">{predictions.total}</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Successful</span>
              <span className="text-green-500">{predictions.successful}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Failed</span>
              <span className="text-red-500">{predictions.failed}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(predictions.successful / predictions.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;