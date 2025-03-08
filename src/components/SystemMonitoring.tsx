import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Globe, Shield, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

type SystemStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

interface ServiceStatusData {
  name: string;
  status: SystemStatus;
  uptime: number; // in percentage
  responseTime: number; // in milliseconds
  lastChecked: number; // timestamp
  icon: React.ReactNode;
  details?: string;
  incidents?: {
    timestamp: number;
    message: string;
    resolved: boolean;
  }[];
}

interface SystemMonitoringProps {
  className?: string;
}

const SystemMonitoring: React.FC<SystemMonitoringProps> = ({ className = '' }) => {
  const [services, setServices] = useState<ServiceStatusData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  // Mock incident data
  const mockIncidents = [
    {
      timestamp: Date.now() - 3600000 * 5, // 5 hours ago
      message: 'Binance API rate limiting caused delayed updates',
      resolved: true
    },
    {
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
      message: 'Database connectivity issues caused prediction service outage',
      resolved: true
    },
    {
      timestamp: Date.now() - 86400000 * 5, // 5 days ago
      message: 'Scheduled maintenance completed successfully',
      resolved: true
    }
  ];

  // Initialize service statuses
  useEffect(() => {
    // Try to load from localStorage first
    const savedStatus = localStorage.getItem('cryptoPrediction_systemStatus');
    
    if (savedStatus) {
      try {
        const { services, timestamp } = JSON.parse(savedStatus);
        setServices(services);
        setLastUpdateTime(timestamp);
      } catch (error) {
        console.error('Error parsing saved system status:', error);
        fetchSystemStatus();
      }
    } else {
      fetchSystemStatus();
    }
  }, []);

  // Mock function to fetch system status
  const fetchSystemStatus = async () => {
    setIsRefreshing(true);

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Generate mock data for demonstration
      const timestamp = Date.now();
      const mockServices: ServiceStatusData[] = [
        {
          name: 'API Service',
          status: Math.random() > 0.9 ? 'degraded' : 'operational',
          uptime: 99.8 + (Math.random() * 0.2),
          responseTime: 150 + Math.random() * 100,
          lastChecked: timestamp,
          icon: <Globe className="w-5 h-5" />,
          details: 'Serving all endpoints',
          incidents: Math.random() > 0.7 ? [mockIncidents[0]] : []
        },
        {
          name: 'Prediction Engine',
          status: Math.random() > 0.95 ? 'degraded' : 'operational',
          uptime: 99.5 + (Math.random() * 0.5),
          responseTime: 200 + Math.random() * 150,
          lastChecked: timestamp,
          icon: <Activity className="w-5 h-5" />,
          details: 'All prediction algorithms functioning normally',
          incidents: Math.random() > 0.8 ? [mockIncidents[0]] : []
        },
        {
          name: 'Database',
          status: Math.random() > 0.93 ? 'degraded' : 'operational',
          uptime: 99.9 + (Math.random() * 0.1),
          responseTime: 50 + Math.random() * 30,
          lastChecked: timestamp,
          icon: <Database className="w-5 h-5" />,
          details: 'All tables and indexes healthy',
          incidents: Math.random() > 0.9 ? [mockIncidents[1]] : []
        },
        {
          name: 'External Data Sources',
          status: Math.random() > 0.8 ? 'degraded' : 'operational',
          uptime: 98.5 + (Math.random() * 1.5),
          responseTime: 300 + Math.random() * 200,
          lastChecked: timestamp,
          icon: <RefreshCw className="w-5 h-5" />,
          details: 'All external APIs responding with acceptable latency',
          incidents: Math.random() > 0.6 ? [mockIncidents[0]] : []
        },
        {
          name: 'Security Services',
          status: 'operational',
          uptime: 99.99,
          responseTime: 80 + Math.random() * 20,
          lastChecked: timestamp,
          icon: <Shield className="w-5 h-5" />,
          details: 'All security protocols active',
          incidents: []
        }
      ];

      setServices(mockServices);
      setLastUpdateTime(timestamp);

      // Save to localStorage for persistence
      localStorage.setItem('cryptoPrediction_systemStatus', JSON.stringify({
        services: mockServices,
        timestamp
      }));
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format time elapsed since last check
  const formatTimeElapsed = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Get status indicator color
  const getStatusColor = (status: SystemStatus): string => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      case 'maintenance':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get background color for status indicator
  const getStatusBgColor = (status: SystemStatus): string => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10';
      case 'degraded':
        return 'bg-yellow-500/10';
      case 'down':
        return 'bg-red-500/10';
      case 'maintenance':
        return 'bg-blue-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  // Get label for status
  const getStatusLabel = (status: SystemStatus): string => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  // Calculate overall system status
  const getOverallStatus = (): SystemStatus => {
    if (services.length === 0) return 'operational';
    
    if (services.some(service => service.status === 'down')) {
      return 'down';
    }
    
    if (services.some(service => service.status === 'degraded')) {
      return 'degraded';
    }
    
    if (services.some(service => service.status === 'maintenance')) {
      return 'maintenance';
    }
    
    return 'operational';
  };

  // Get all active incidents across all services
  const getActiveIncidents = () => {
    return services
      .flatMap(service => service.incidents || [])
      .filter(incident => !incident.resolved)
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  const activeIncidents = getActiveIncidents();
  const overallStatus = getOverallStatus();

  return (
    <Card className={`p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <Server className="w-5 h-5 mr-2 text-blue-500" />
          <h3 className="font-medium">System Status</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdateTime && (
            <span className="text-xs text-gray-400">
              Updated {formatTimeElapsed(lastUpdateTime)}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchSystemStatus}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${getStatusBgColor(overallStatus)} border border-${getStatusColor(overallStatus).replace('text-', '')}/30`}>
        <div className="flex items-center">
          {overallStatus === 'operational' ? (
            <CheckCircle className={`w-5 h-5 mr-2 ${getStatusColor(overallStatus)}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 mr-2 ${getStatusColor(overallStatus)}`} />
          )}
          <div>
            <div className={`font-medium ${getStatusColor(overallStatus)}`}>
              {getStatusLabel(overallStatus)}
            </div>
            <div className="text-xs text-gray-400">
              {overallStatus === 'operational' 
                ? 'All systems running normally' 
                : overallStatus === 'degraded'
                ? 'Some services are experiencing issues'
                : overallStatus === 'down'
                ? 'Critical services unavailable'
                : 'Scheduled maintenance in progress'}
            </div>
          </div>
        </div>
        
        {activeIncidents.length > 0 && (
          <div className="text-yellow-500 text-sm font-medium">
            {activeIncidents.length} active {activeIncidents.length === 1 ? 'incident' : 'incidents'}
          </div>
        )}
      </div>

      {/* Service Statuses */}
      <div className="space-y-2">
        {services.map((service, index) => (
          <div 
            key={service.name}
            className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-1.5 rounded-full ${getStatusBgColor(service.status)} mr-3`}>
                  <div className={getStatusColor(service.status)}>
                    {service.icon}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-gray-400">{service.details}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                  {getStatusLabel(service.status)}
                </div>
                <div className="text-xs text-gray-400">
                  {service.uptime.toFixed(2)}% uptime
                </div>
              </div>
            </div>
            
            {/* Service metrics */}
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <div>Response: {Math.round(service.responseTime)}ms</div>
              <div>Checked: {formatTimeElapsed(service.lastChecked)}</div>
            </div>
            
            {/* Incidents for this service */}
            {service.incidents && service.incidents.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                {service.incidents.map((incident, idx) => (
                  <div key={idx} className="text-xs flex items-start mt-1">
                    <div className={`w-2 h-2 rounded-full mt-1 mr-1.5 ${incident.resolved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <span className="text-gray-300">{incident.message}</span>
                      <span className="text-gray-500 ml-1">
                        ({formatTimeElapsed(incident.timestamp)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Deployment Information */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 font-medium mb-2">Deployment Info</div>
        <div className="flex flex-wrap gap-y-2">
          <div className="w-1/2 text-xs">
            <span className="text-gray-500">Version:</span>
            <span className="ml-2 text-gray-300">1.3.5</span>
          </div>
          <div className="w-1/2 text-xs">
            <span className="text-gray-500">Environment:</span>
            <span className="ml-2 text-gray-300">Production</span>
          </div>
          <div className="w-1/2 text-xs">
            <span className="text-gray-500">Last Deploy:</span>
            <span className="ml-2 text-gray-300">
              {new Date(Date.now() - 86400000 * 2).toLocaleDateString()}
            </span>
          </div>
          <div className="w-1/2 text-xs">
            <span className="text-gray-500">Build:</span>
            <span className="ml-2 text-gray-300">#1245</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemMonitoring;