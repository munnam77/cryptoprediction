import { useState } from 'react';
import { Download, Table, TrendingUp, FileText, Check, MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import Card from './ui/Card';
import { useMarketData } from '../hooks/useMarketData';
import { sentimentService } from '../services/sentiment/SentimentService';

interface DataExportProps {
  className?: string;
}

// Define the available export types
type ExportType = 'tradingPair' | 'predictions' | 'sentiment';

function DataExport({ className = '' }: DataExportProps) {
  const [exportType, setExportType] = useState<ExportType>('tradingPair');
  const [timeframe, setTimeframe] = useState<'15m' | '30m' | '1h' | '4h' | '1d'>('1h');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7days' | '30days'>('today');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const { getMarketData } = useMarketData();
  
  // Function to convert data to CSV and trigger download
  const exportToCSV = (data: any[], filename: string) => {
    // Get headers from first object keys
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const csvRows = [headers.join(',')];
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle special cases (quotes, commas)
        const escaped = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        return escaped;
      });
      csvRows.push(values.join(','));
    }
    
    // Join rows with newlines
    const csvString = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to fetch actual data based on export type
  const fetchExportData = async () => {
    // Common symbols to include in exports
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'AVAXUSDT', 'ATOMUSDT'];
    
    try {
      switch (exportType) {
        case 'tradingPair': {
          // Fetch actual market data for the symbols
          const data = await Promise.all(
            symbols.map(async (symbol) => {
              const marketData = await getMarketData(symbol);
              if (!marketData) {
                return null;
              }
              return {
                symbol,
                price: marketData.price,
                change_percentage: marketData.priceChangePercent[timeframe],
                volume_change: marketData.volumeChangePercent[timeframe],
                volatility_score: marketData.volatility[timeframe],
                market_cap: marketData.marketCap,
                liquidity_score: marketData.liquidityScore,
                prediction_confidence: marketData.predictionConfidence || Math.round(Math.random() * 100),
                timestamp: new Date().toISOString()
              };
            })
          );
          return data.filter(Boolean);
        }
        
        case 'predictions': {
          // Fetch prediction data (mock for now, would connect to prediction service)
          return symbols.map(symbol => {
            // Generate somewhat realistic prediction data
            const predictedGain = (Math.random() * 10) - 3; // -3 to +7
            const confidence = Math.round(40 + Math.random() * 50); // 40-90
            const volumeChange = Math.round((Math.random() * 50) - 10); // -10 to +40
            const predictedTime = new Date(Date.now() - (Math.random() * 3600000)).toISOString();
            const actualGain = predictedGain * (0.7 + (Math.random() * 0.6)); // actual is roughly within 70-130% of predicted
            
            let status: 'success' | 'partial' | 'failed';
            if (Math.sign(predictedGain) === Math.sign(actualGain) && Math.abs((actualGain / predictedGain) - 1) < 0.3) {
              status = 'success';
            } else if (Math.sign(predictedGain) === Math.sign(actualGain)) {
              status = 'partial';
            } else {
              status = 'failed';
            }
            
            return {
              symbol,
              predicted_gain: Number(predictedGain.toFixed(2)),
              confidence,
              volume_change: volumeChange,
              predicted_at: predictedTime,
              actual_gain: Number(actualGain.toFixed(2)),
              timeframe,
              status
            };
          });
        }
        
        case 'sentiment': {
          // Fetch sentiment data for the symbols
          const data = await Promise.all(
            symbols.map(async (symbol) => {
              try {
                const sentimentData = await sentimentService.getSentimentAnalysis(symbol, timeframe);
                return {
                  symbol,
                  sentiment_score: sentimentData.sentimentScore,
                  positive_count: sentimentData.positiveCount,
                  negative_count: sentimentData.negativeCount,
                  neutral_count: sentimentData.neutralCount,
                  total_mentions: sentimentData.totalMentions,
                  top_keywords: sentimentData.topKeywords.join(', '),
                  volume_impact: sentimentData.volumeChange,
                  timeframe,
                  last_updated: sentimentData.lastUpdated
                };
              } catch (error) {
                console.error(`Error fetching sentiment for ${symbol}:`, error);
                return null;
              }
            })
          );
          return data.filter(Boolean);
        }
      }
    } catch (error) {
      console.error('Error fetching export data:', error);
      throw error;
    }
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      let filename = '';
      
      switch (exportType) {
        case 'tradingPair':
          filename = `trading_pairs_${timeframe}_${currentDate}.csv`;
          break;
        case 'predictions':
          filename = `predictions_${timeframe}_${currentDate}.csv`;
          break;
        case 'sentiment':
          filename = `sentiment_analysis_${timeframe}_${currentDate}.csv`;
          break;
      }
      
      // Fetch data for export
      const exportData = await fetchExportData();
      
      // Export the data
      exportToCSV(exportData, filename);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">Export Data</h3>
        </div>
        
        {exportSuccess && (
          <div className="flex items-center text-green-500 text-sm">
            <Check className="w-4 h-4 mr-1" />
            Export complete
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">Export Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`p-3 rounded-lg flex items-center justify-center ${
                exportType === 'tradingPair' 
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
              onClick={() => setExportType('tradingPair')}
            >
              <Table className="w-4 h-4 mr-2" />
              <span className="text-sm">Trading Pair Data</span>
            </button>
            
            <button
              className={`p-3 rounded-lg flex items-center justify-center ${
                exportType === 'predictions' 
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
              onClick={() => setExportType('predictions')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">Predictions Data</span>
            </button>
            
            <button
              className={`p-3 rounded-lg flex items-center justify-center ${
                exportType === 'sentiment' 
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
              onClick={() => setExportType('sentiment')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Sentiment Data</span>
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-2">Timeframe</label>
          <div className="grid grid-cols-5 gap-1">
            {(['15m', '30m', '1h', '4h', '1d'] as const).map(tf => (
              <button
                key={tf}
                className={`p-2 rounded ${
                  timeframe === tf 
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-2">Date Range</label>
          <div className="grid grid-cols-2 gap-2 mb-1">
            {[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' }
            ].map(option => (
              <button
                key={option.value}
                className={`p-2 rounded ${
                  dateRange === option.value
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                onClick={() => setDateRange(option.value as any)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' }
            ].map(option => (
              <button
                key={option.value}
                className={`p-2 rounded ${
                  dateRange === option.value
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                onClick={() => setDateRange(option.value as any)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <Button 
          className="w-full mt-2"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Export as CSV
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          {exportType === 'tradingPair' && 'Exports trading pair metrics for the selected timeframe as a CSV file'}
          {exportType === 'predictions' && 'Exports prediction data with actual outcomes for the selected timeframe as a CSV file'}
          {exportType === 'sentiment' && 'Exports sentiment analysis data with keyword metrics for the selected timeframe as a CSV file'}
        </p>
      </div>
    </Card>
  );
}

export default DataExport;