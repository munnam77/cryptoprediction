import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';
import Card from './ui/Card';
import { DataValidationService } from '../services/validation/DataValidationService';

interface SyncStatus {
  isSynced: boolean;
  syncGaps: { timeframe: string; lastSync: number }[];
  errors: string[];
}

interface ValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function MonitoringDashboard() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [validationStatus, setValidationStatus] = useState<
    Record<string, ValidationStatus>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const timeframes = ['15m', '30m', '1h', '4h', '1d'];
  const validationService = DataValidationService.getInstance();

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      // Check sync status
      const sync = await validationService.validateDataSync();
      setSyncStatus(sync);

      // Check validation status for each timeframe
      const validation: Record<string, ValidationStatus> = {};
      for (const timeframe of timeframes) {
        validation[timeframe] = await validationService.validateMarketData('BTCUSDT', timeframe);
      }
      setValidationStatus(validation);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Monitoring check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">System Monitoring</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last update: {formatTimeAgo(lastUpdate.getTime())}
          </span>
          <button
            onClick={checkStatus}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Data Sync Status</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {syncStatus?.isSynced ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-yellow-500" />
              )}
              <span className={syncStatus?.isSynced ? 'text-green-500' : 'text-yellow-500'}>
                {syncStatus?.isSynced ? 'All timeframes synced' : 'Sync gaps detected'}
              </span>
            </div>
          </div>
          
          {syncStatus?.syncGaps.length > 0 && (
            <div className="space-y-2">
              {syncStatus.syncGaps.map(({ timeframe, lastSync }) => (
                <div key={timeframe} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{timeframe}</span>
                  <span className="text-yellow-500">Last sync: {formatTimeAgo(lastSync)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Validation Status */}
      <div>
        <h3 className="text-sm font-medium mb-3">Data Validation Status</h3>
        <div className="space-y-3">
          {timeframes.map(timeframe => {
            const status = validationStatus[timeframe];
            return (
              <div key={timeframe} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {status?.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{timeframe}</span>
                  </div>
                  <span className={
                    status?.isValid
                      ? 'text-green-500'
                      : status?.warnings.length > 0 && status?.errors.length === 0
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }>
                    {status?.isValid ? 'Valid' : 'Issues detected'}
                  </span>
                </div>

                {(status?.errors.length > 0 || status?.warnings.length > 0) && (
                  <div className="mt-2 space-y-1">
                    {status.errors.map((error, i) => (
                      <div key={i} className="text-sm text-red-500 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{error}</span>
                      </div>
                    ))}
                    {status.warnings.map((warning, i) => (
                      <div key={i} className="text-sm text-yellow-500 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default MonitoringDashboard;