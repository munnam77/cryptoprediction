import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X, Settings, TrendingUp, Activity, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import Card from './ui/Card';
import { useMarketData } from '../hooks/useMarketData';
import { sentimentService } from '../services/sentiment/SentimentService';

interface Alert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'sentiment';
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  threshold: number;
  direction: 'above' | 'below';
  createdAt: number;
  triggeredAt?: number;
  isActive: boolean;
  soundEnabled?: boolean;
}

interface AlertSystemProps {
  className?: string;
}

function AlertSystem({ className = '' }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState<Omit<Alert, 'id' | 'createdAt' | 'isActive'>>({
    symbol: '',
    type: 'price',
    timeframe: '1h',
    threshold: 10,
    direction: 'above',
    soundEnabled: true
  });
  const [triggeredAlerts, setTriggeredAlerts] = useState<Alert[]>([]);
  const [showTriggered, setShowTriggered] = useState(false);
  const { getMarketData } = useMarketData();

  // Sound effect for alerts
  const alertSound = new Audio('/alert.mp3');

  // Load saved alerts on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('cryptoPrediction_alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }

    const savedTriggered = localStorage.getItem('cryptoPrediction_triggeredAlerts');
    if (savedTriggered) {
      setTriggeredAlerts(JSON.parse(savedTriggered));
    }
  }, []);

  // Save alerts to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('cryptoPrediction_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('cryptoPrediction_triggeredAlerts', JSON.stringify(triggeredAlerts));
  }, [triggeredAlerts]);

  // Check alerts against real market data
  useEffect(() => {
    const checkAlerts = async () => {
      const activeAlerts = alerts.filter(alert => alert.isActive);
      if (activeAlerts.length === 0) return;

      const symbols = [...new Set(activeAlerts.map(alert => alert.symbol))];
      const newTriggeredAlerts: Alert[] = [];

      for (const symbol of symbols) {
        try {
          // Check price and volume alerts
          const marketData = await getMarketData(symbol);
          if (!marketData) continue;

          const alertsForSymbol = activeAlerts.filter(alert => alert.symbol === symbol);
          
          for (const alert of alertsForSymbol) {
            // For price and volume alerts, use market data
            if (alert.type === 'price' || alert.type === 'volume') {
              const value = alert.type === 'price' 
                ? marketData.priceChangePercent[alert.timeframe]
                : marketData.volumeChangePercent[alert.timeframe];

              if (!value) continue;

              const shouldTrigger = 
                (alert.direction === 'above' && value >= alert.threshold) ||
                (alert.direction === 'below' && value <= alert.threshold);

              if (shouldTrigger) {
                const triggeredAlert = {
                  ...alert,
                  isActive: false,
                  triggeredAt: Date.now()
                };

                newTriggeredAlerts.push(triggeredAlert);

                // Play sound if enabled
                if (alert.soundEnabled) {
                  alertSound.play().catch(console.error);
                }

                // Show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Crypto Alert Triggered', {
                    body: `${alert.symbol} ${alert.type} is now ${alert.direction} ${alert.threshold}% on ${alert.timeframe} timeframe`,
                    icon: '/favicon.ico'
                  });
                }
              }
            } 
            // For sentiment alerts, use sentiment service
            else if (alert.type === 'sentiment') {
              try {
                const sentimentData = await sentimentService.getSentimentAnalysis(symbol, alert.timeframe);
                if (!sentimentData) continue;

                const value = sentimentData.sentimentScore;
                
                const shouldTrigger = 
                  (alert.direction === 'above' && value >= alert.threshold) ||
                  (alert.direction === 'below' && value <= alert.threshold);

                if (shouldTrigger) {
                  const triggeredAlert = {
                    ...alert,
                    isActive: false,
                    triggeredAt: Date.now()
                  };

                  newTriggeredAlerts.push(triggeredAlert);

                  // Play sound if enabled
                  if (alert.soundEnabled) {
                    alertSound.play().catch(console.error);
                  }

                  // Show browser notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Sentiment Alert Triggered', {
                      body: `${alert.symbol} sentiment is now ${alert.direction} ${alert.threshold}% on ${alert.timeframe} timeframe`,
                      icon: '/favicon.ico'
                    });
                  }
                }
              } catch (sentimentError) {
                console.error(`Error checking sentiment alerts for ${symbol}:`, sentimentError);
              }
            }
          }
        } catch (error) {
          console.error(`Error checking alerts for ${symbol}:`, error);
        }
      }

      if (newTriggeredAlerts.length > 0) {
        setTriggeredAlerts(prev => [...newTriggeredAlerts, ...prev]);
        setAlerts(prev => 
          prev.map(alert => 
            newTriggeredAlerts.some(triggered => triggered.id === alert.id)
              ? { ...alert, isActive: false }
              : alert
          )
        );
      }
    };

    const intervalId = setInterval(checkAlerts, 60 * 1000); // Check every minute
    checkAlerts(); // Initial check
    
    return () => clearInterval(intervalId);
  }, [alerts, getMarketData]);

  const handleAddAlert = () => {
    // Request notification permission if needed
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    const newAlertWithId: Alert = {
      ...newAlert,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isActive: true
    };
    
    setAlerts(prev => [...prev, newAlertWithId]);
    setShowAddAlert(false);
    setNewAlert({
      symbol: '',
      type: 'price',
      timeframe: '1h',
      threshold: 10,
      direction: 'above',
      soundEnabled: true
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleClearTriggeredAlert = (id: string) => {
    setTriggeredAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Get the icon for the alert type
  const getAlertTypeIcon = (type: 'price' | 'volume' | 'sentiment') => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-3 h-3 mr-1" />;
      case 'volume':
        return <Activity className="w-3 h-3 mr-1" />;
      case 'sentiment':
        return <MessageCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">Price, Volume & Sentiment Alerts</h3>
        </div>
        
        <div className="flex space-x-2">
          {triggeredAlerts.length > 0 && (
            <button
              className="flex items-center text-xs text-yellow-500 hover:text-yellow-400"
              onClick={() => setShowTriggered(prev => !prev)}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              {triggeredAlerts.length}
            </button>
          )}
          
          <Button
            size="sm"
            onClick={() => setShowAddAlert(true)}
            disabled={showAddAlert}
          >
            + New Alert
          </Button>
        </div>
      </div>

      {showAddAlert && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">Create New Alert</h4>
            <button onClick={() => setShowAddAlert(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="symbol" className="block text-xs text-gray-400 mb-1">
                Trading Pair
              </label>
              <input
                id="symbol"
                type="text"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="e.g. BTCUSDT"
                className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <label htmlFor="type" className="block text-xs text-gray-400 mb-1">
                  Alert Type
                </label>
                <select
                  id="type"
                  value={newAlert.type}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as 'price' | 'volume' | 'sentiment' }))}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
                >
                  <option value="price">Price Change %</option>
                  <option value="volume">Volume Change %</option>
                  <option value="sentiment">Sentiment Score</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label htmlFor="timeframe" className="block text-xs text-gray-400 mb-1">
                  Timeframe
                </label>
                <select
                  id="timeframe"
                  value={newAlert.timeframe}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, timeframe: e.target.value as '15m' | '30m' | '1h' | '4h' | '1d' }))}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
                >
                  <option value="15m">15m</option>
                  <option value="30m">30m</option>
                  <option value="1h">1h</option>
                  <option value="4h">4h</option>
                  <option value="1d">1d</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <div className="flex-1">
                <label htmlFor="direction" className="block text-xs text-gray-400 mb-1">
                  Direction
                </label>
                <select
                  id="direction"
                  value={newAlert.direction}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, direction: e.target.value as 'above' | 'below' }))}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label htmlFor="threshold" className="block text-xs text-gray-400 mb-1">
                  {newAlert.type === 'sentiment' ? 'Score' : 'Threshold (%)'} 
                </label>
                <input
                  id="threshold"
                  type="number"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-sm"
                  min={newAlert.type === 'sentiment' ? 0 : undefined}
                  max={newAlert.type === 'sentiment' ? 100 : undefined}
                />
                {newAlert.type === 'sentiment' && (
                  <div className="text-xs text-gray-400 mt-1">
                    Enter a value between 0-100 (0 = Very Bearish, 100 = Very Bullish)
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="soundEnabled"
                type="checkbox"
                checked={newAlert.soundEnabled}
                onChange={(e) => setNewAlert(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="soundEnabled" className="text-xs text-gray-400">
                Enable Sound Notification
              </label>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button onClick={handleAddAlert} disabled={!newAlert.symbol}>
                Create Alert
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTriggered && triggeredAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800/60 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-yellow-500 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Triggered Alerts
            </h4>
            <button 
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setTriggeredAlerts([])}
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {triggeredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className="flex justify-between items-center p-2 bg-gray-700/50 rounded text-sm"
              >
                <div>
                  <div className="font-medium flex items-center">
                    {getAlertTypeIcon(alert.type)}
                    {alert.symbol} {alert.type === 'sentiment' ? 'Sentiment' : (alert.type === 'price' ? 'Price' : 'Volume')} 
                    {' '}{alert.direction === 'above' ? '>' : '<'} {alert.threshold}{alert.type !== 'sentiment' && '%'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Triggered {alert.triggeredAt ? formatTimeAgo(alert.triggeredAt) : ''}
                  </div>
                </div>
                <button 
                  onClick={() => handleClearTriggeredAlert(alert.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`flex justify-between items-center p-3 rounded-lg border ${
                alert.isActive ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-800/30 border-gray-800'
              }`}
            >
              <div>
                <div className="font-medium flex items-center">
                  {alert.isActive ? (
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  ) : (
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  )}
                  {getAlertTypeIcon(alert.type)}
                  {alert.symbol}
                </div>
                <div className="text-sm text-gray-400">
                  {alert.type === 'sentiment' ? 'Sentiment' : (alert.type === 'price' ? 'Price' : 'Volume')} 
                  {' '}{alert.direction === 'above' ? '>' : '<'} {alert.threshold}
                  {alert.type !== 'sentiment' && '%'} ({alert.timeframe})
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className={`p-1 rounded-full ${
                    alert.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'
                  }`}
                  onClick={() => handleToggleAlert(alert.id)}
                  title={alert.isActive ? 'Disable alert' : 'Enable alert'}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  className="p-1 rounded-full bg-red-500/10 text-red-500"
                  onClick={() => handleDeleteAlert(alert.id)}
                  title="Delete alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active alerts</p>
          <p className="text-xs mt-1">Create alerts for price, volume and sentiment changes</p>
        </div>
      )}
    </Card>
  );
}

export default AlertSystem;