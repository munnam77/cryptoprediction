import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

export interface Alert {
  id: string;
  symbol: string;
  type: 'price' | 'change' | 'volume' | 'volatility';
  condition: 'above' | 'below' | 'crosses';
  value: number;
  duration: number; // in hours
  createdAt: number;
  triggered?: boolean;
  triggeredAt?: number;
  dismissed?: boolean;
}

interface SmartAlertSystemProps {
  alerts: Alert[];
  onCreateAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  onToggleAlertSystem: () => void;
  enabled: boolean;
  className?: string;
}

/**
 * SmartAlertSystem Component
 * Displays and manages user alerts for trading pairs
 */
const SmartAlertSystem: React.FC<SmartAlertSystemProps> = ({
  alerts,
  onCreateAlert,
  onDismissAlert,
  onClearAllAlerts,
  onToggleAlertSystem,
  enabled,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newAlerts, setNewAlerts] = useState<string[]>([]);
  
  // Track new alerts for animation
  useEffect(() => {
    const alertIds = alerts.map(alert => alert.id);
    const currentAlertIds = new Set(alertIds);
    
    // Find new alerts that weren't in the previous render
    setNewAlerts(prev => {
      const newOnes = alertIds.filter(id => !prev.includes(id));
      return [...prev, ...newOnes];
    });
    
    // Remove alerts that no longer exist from newAlerts
    setNewAlerts(prev => prev.filter(id => currentAlertIds.has(id)));
    
    // Auto-expand when new alerts come in
    if (alerts.some(alert => alert.triggered && !alert.dismissed)) {
      setIsExpanded(true);
    }
  }, [alerts]);
  
  // Remove animation class after animation completes
  useEffect(() => {
    if (newAlerts.length > 0) {
      const timer = setTimeout(() => {
        setNewAlerts([]);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [newAlerts]);
  
  // Get active alerts (not dismissed)
  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  
  // Get triggered alerts
  const triggeredAlerts = activeAlerts.filter(alert => alert.triggered);
  
  // Get pending alerts
  const pendingAlerts = activeAlerts.filter(alert => !alert.triggered);
  
  // Format alert value based on type
  const formatAlertValue = (alert: Alert): string => {
    switch (alert.type) {
      case 'price':
        return `$${alert.value.toLocaleString('en-US', { 
          minimumFractionDigits: alert.value < 1 ? 4 : 2,
          maximumFractionDigits: alert.value < 1 ? 8 : 2
        })}`;
      case 'change':
        return `${alert.value}%`;
      case 'volume':
        return `$${alert.value >= 1_000_000 
          ? (alert.value / 1_000_000).toFixed(2) + 'M' 
          : alert.value >= 1_000 
            ? (alert.value / 1_000).toFixed(2) + 'K' 
            : alert.value.toFixed(2)
        }`;
      case 'volatility':
        return `${alert.value}%`;
      default:
        return alert.value.toString();
    }
  };
  
  // Get alert icon based on type
  const getAlertIcon = (alert: Alert): JSX.Element => {
    switch (alert.type) {
      case 'price':
        return <DollarSign size={16} />;
      case 'change':
        return alert.condition === 'above' ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
      case 'volume':
        return <BarChart3 size={16} />;
      case 'volatility':
        return <AlertTriangle size={16} />;
      default:
        return <Bell size={16} />;
    }
  };
  
  // Get time remaining for alert
  const getTimeRemaining = (alert: Alert): string => {
    const createdTime = alert.createdAt;
    const expirationTime = createdTime + (alert.duration * 60 * 60 * 1000);
    const now = Date.now();
    
    if (now > expirationTime) return 'Expired';
    
    const hoursRemaining = Math.floor((expirationTime - now) / (60 * 60 * 1000));
    const minutesRemaining = Math.floor(((expirationTime - now) % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m`;
    } else {
      return `${minutesRemaining}m`;
    }
  };
  
  // Get alert description
  const getAlertDescription = (alert: Alert): string => {
    const typeText = alert.type.charAt(0).toUpperCase() + alert.type.slice(1);
    const conditionText = alert.condition;
    const valueText = formatAlertValue(alert);
    
    return `${typeText} ${conditionText} ${valueText}`;
  };
  
  // Get alert status class
  const getAlertStatusClass = (alert: Alert): string => {
    if (alert.triggered) return 'bg-yellow-900/30 border-yellow-700';
    return 'bg-gray-800 border-gray-700';
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Alert toggle button */}
      <button
        onClick={onToggleAlertSystem}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg z-50 ${
          enabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={enabled ? 'Disable alerts' : 'Enable alerts'}
      >
        {enabled ? <Bell size={20} /> : <BellOff size={20} />}
        
        {/* Alert count badge */}
        {enabled && triggeredAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {triggeredAlerts.length}
          </span>
        )}
      </button>
      
      {/* Alert panel */}
      {enabled && (
        <div 
          className={`fixed bottom-20 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-40 ${
            isExpanded ? 'max-h-96' : 'max-h-12'
          }`}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 bg-gray-800 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center">
              <Bell size={16} className="mr-2 text-blue-400" />
              <span className="font-medium">Alert System</span>
              {triggeredAlerts.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {triggeredAlerts.length}
                </span>
              )}
            </div>
            <div className="flex items-center">
              {activeAlerts.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAllAlerts();
                  }}
                  className="text-xs text-gray-400 hover:text-gray-300 mr-2"
                >
                  Clear all
                </button>
              )}
              <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto p-2">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Bell size={24} className="mx-auto mb-2 text-gray-600" />
                <p>No active alerts</p>
                <p className="text-xs mt-1">Create alerts using the pin icon in the trading table</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Triggered alerts */}
                {triggeredAlerts.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-yellow-500 font-medium mb-1 px-1">Triggered Alerts</div>
                    {triggeredAlerts.map(alert => (
                      <div 
                        key={alert.id}
                        className={`relative p-2 rounded border ${getAlertStatusClass(alert)} ${
                          newAlerts.includes(alert.id) ? 'animate-pulse-alert' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="mr-2 text-yellow-500">
                              {getAlertIcon(alert)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{alert.symbol}</div>
                              <div className="text-xs text-gray-400">{getAlertDescription(alert)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => onDismissAlert(alert.id)}
                            className="text-gray-500 hover:text-gray-300"
                            title="Dismiss alert"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="mt-1 flex justify-between items-center text-xs">
                          <span className="text-yellow-500">
                            Triggered {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString() : ''}
                          </span>
                          <button
                            onClick={() => onDismissAlert(alert.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                          >
                            <Check size={12} className="mr-1" />
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pending alerts */}
                {pendingAlerts.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 font-medium mb-1 px-1">Pending Alerts</div>
                    {pendingAlerts.map(alert => (
                      <div 
                        key={alert.id}
                        className={`relative p-2 rounded border ${getAlertStatusClass(alert)} ${
                          newAlerts.includes(alert.id) ? 'animate-pulse-alert' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="mr-2 text-blue-400">
                              {getAlertIcon(alert)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{alert.symbol}</div>
                              <div className="text-xs text-gray-400">{getAlertDescription(alert)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => onDismissAlert(alert.id)}
                            className="text-gray-500 hover:text-gray-300"
                            title="Dismiss alert"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
                          <span>Expires in {getTimeRemaining(alert)}</span>
                          <span>Created {new Date(alert.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAlertSystem; 