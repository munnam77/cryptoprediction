import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import Card from './ui/Card';
import { sentimentService } from '../services/sentiment/SentimentService';
import { SentimentAnalysisResult } from '../types/model';

interface SentimentAnalysisProps {
  symbol: string;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  className?: string;
}

function SentimentAnalysis({ symbol, timeframe, className = '' }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<SentimentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentimentData = async () => {
      setIsLoading(true);
      try {
        // Use our sentiment service directly
        const data = await sentimentService.getSentimentAnalysis(symbol, timeframe);
        setSentimentData(data);
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError('Unable to load sentiment data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentimentData();
    
    // Refresh sentiment data periodically (every 5 minutes)
    const intervalId = setInterval(fetchSentimentData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [symbol, timeframe]);

  const getSentimentColor = (score: number) => {
    // Convert 0-100 scale to appropriate colors
    if (score > 65) return 'text-green-500';
    if (score < 35) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentLabel = (score: number) => {
    // Convert 0-100 scale to labels
    if (score > 80) return 'Very Bullish';
    if (score > 65) return 'Bullish';
    if (score > 55) return 'Slightly Bullish';
    if (score >= 45 && score <= 55) return 'Neutral';
    if (score > 35) return 'Slightly Bearish';
    if (score > 20) return 'Bearish';
    return 'Very Bearish';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-gray-600 rounded mr-2"></div>
            <div className="h-4 bg-gray-600 rounded w-40"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            <div className="h-10 bg-gray-600 rounded w-full"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !sentimentData) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-500 mb-3">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-medium">Sentiment Analysis</h3>
        </div>
        <p className="text-sm text-gray-400">{error || 'No sentiment data available'}</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium">X Sentiment Analysis</h3>
        </div>
        <span className="text-xs text-gray-400">
          Updated {formatTime(sentimentData.lastUpdated)}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Sentiment</span>
          <div className="flex items-center space-x-1">
            {sentimentData.sentimentScore > 50 ? (
              <TrendingUp className={`w-4 h-4 ${getSentimentColor(sentimentData.sentimentScore)}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${getSentimentColor(sentimentData.sentimentScore)}`} />
            )}
            <span className={`text-sm font-medium ${getSentimentColor(sentimentData.sentimentScore)}`}>
              {getSentimentLabel(sentimentData.sentimentScore)}
            </span>
          </div>
        </div>

        <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 bottom-0 left-0 ${getSentimentColor(sentimentData.sentimentScore)}`}
            style={{ 
              width: `${sentimentData.sentimentScore}%`,
              opacity: 0.7
            }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Sentiment Distribution</div>
          <div className="flex items-center text-xs">
            <span className="text-green-500">+{sentimentData.positiveCount}</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-yellow-500">{sentimentData.neutralCount}</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-red-500">-{sentimentData.negativeCount}</span>
          </div>
        </div>
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Posts Analyzed</div>
          <div className="text-lg font-semibold">
            {sentimentData.totalMentions}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-300">Volume Impact</h4>
          <div className={`text-sm font-medium ${sentimentData.volumeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {sentimentData.volumeChange >= 0 ? '+' : ''}{sentimentData.volumeChange.toFixed(2)}%
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Estimated volume change based on current sentiment
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center">
          <BarChart2 className="w-4 h-4 mr-1 inline" />
          Top Keywords
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {sentimentData.topKeywords.map((keyword, index) => {
            // Calculate a sentiment color based on the word itself
            // This is just for visualization purposes
            const keywordSentiment = keyword.includes("bull") || keyword.includes("moon") || 
                                    keyword.includes("buy") || keyword.includes("up") ? 75 :
                                    keyword.includes("bear") || keyword.includes("dump") || 
                                    keyword.includes("sell") || keyword.includes("down") ? 25 : 50;
            
            return (
              <span 
                key={index}
                className={`text-xs px-2 py-1 rounded-full font-medium ${getSentimentColor(keywordSentiment)}`}
                style={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
              >
                {keyword}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default SentimentAnalysis;