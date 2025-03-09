import React, { useState } from 'react';
import { Pin, Bell, X } from 'lucide-react';

interface CustomTriggerPinProps {
  symbol: string;
  onSetAlert?: (settings: AlertSettings) => void;
  onClick?: (symbol: string) => void;  // Add onClick handler
  className?: string;
}

export interface AlertSettings {
  symbol: string;
  triggerType: 'price' | 'volume' | 'volatility';
  condition: 'above' | 'below' | 'crosses';
  value: number;
  notificationType: ('app' | 'email' | 'telegram')[];
}

/**
 * CustomTriggerPin Component
 * Pin icon that opens alert settings for the Smart Alert System
 */
const CustomTriggerPin: React.FC<CustomTriggerPinProps> = ({
  symbol,
  onSetAlert,
  onClick,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AlertSettings>({
    symbol,
    triggerType: 'price',
    condition: 'above',
    value: 0,
    notificationType: ['app']
  });

  // Handle pin click with both panel toggle and external handler
  const handleClick = () => {
    togglePanel();
    if (onClick) {
      onClick(symbol);
    }
  };
  
  // Toggle settings panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle settings change
  const handleChange = (field: keyof AlertSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle notification type toggle
  const toggleNotificationType = (type: 'app' | 'email' | 'telegram') => {
    setSettings(prev => {
      const currentTypes = [...prev.notificationType];
      const index = currentTypes.indexOf(type);
      
      if (index >= 0) {
        currentTypes.splice(index, 1);
      } else {
        currentTypes.push(type);
      }
      
      return {
        ...prev,
        notificationType: currentTypes
      };
    });
  };
  
  // Save alert settings
  const saveSettings = () => {
    if (onSetAlert) {
      onSetAlert(settings);
    }
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
        title="Set custom alert"
      >
        <Pin className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-6 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Set Alert for {symbol}
            </h3>
            <button
              onClick={togglePanel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Trigger Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trigger Type
              </label>
              <select
                value={settings.triggerType}
                onChange={(e) => handleChange('triggerType', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="price">Price</option>
                <option value="volume">Volume</option>
                <option value="volatility">Volatility</option>
              </select>
            </div>
            
            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Condition
              </label>
              <select
                value={settings.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="above">Goes Above</option>
                <option value="below">Goes Below</option>
                <option value="crosses">Crosses</option>
              </select>
            </div>
            
            {/* Value */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value
              </label>
              <input
                type="number"
                value={settings.value}
                onChange={(e) => handleChange('value', parseFloat(e.target.value))}
                className="w-full px-2 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                step={settings.triggerType === 'price' ? 0.0001 : 1}
              />
            </div>
            
            {/* Notification Types */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notification
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleNotificationType('app')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    settings.notificationType.includes('app')
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  App
                </button>
                <button
                  onClick={() => toggleNotificationType('email')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    settings.notificationType.includes('email')
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => toggleNotificationType('telegram')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    settings.notificationType.includes('telegram')
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Telegram
                </button>
              </div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={saveSettings}
              className="w-full mt-2 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Set Alert</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTriggerPin;
