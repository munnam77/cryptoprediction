import axios from 'axios';
import { DatabaseService } from '../database/DatabaseService';
import { DB_CONFIG } from '../../config/database.config';
import { SentimentAnalysisResult } from '../../types/model';

// Twitter/X API configuration
const TWITTER_API_CONFIG = {
  BASE_URL: 'https://api.twitter.com/2',
  TWEETS_ENDPOINT: '/tweets/search/recent',
  MAX_RESULTS: 100,
  REQUEST_DELAY: 1000 * 60 * 15, // 15 minutes to avoid rate limiting
  HEADERS: {
    'Authorization': `Bearer ${process.env.TWITTER_API_BEARER_TOKEN || ''}`,
    'Content-Type': 'application/json'
  },
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes cache
};

// NLP model for sentiment analysis
interface SentimentAnalysis {
  asset: string;
  score: number; // -1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive
  magnitude: number; // 0 to +inf, representing strength of sentiment regardless of polarity
  tweets_analyzed: number; 
  timestamp: number;
  sources: {
    twitter: number; // percentage from twitter
    reddit?: number; // percentage from reddit if available
    news?: number;   // percentage from news if available
  };
  keywords: {
    word: string;
    frequency: number;
    sentiment: number;
  }[];
}

/**
 * Service for analyzing sentiment data from social media platforms like X (Twitter)
 * Used for enhancing predictions and providing sentiment-based alerts
 */
class SentimentService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.sentimentapi.com/v1';
  private cachedSentiment: Map<string, {
    result: SentimentAnalysisResult,
    timestamp: number
  }> = new Map();
  
  // Cache TTL in milliseconds (10 minutes)
  private CACHE_TTL = 10 * 60 * 1000;

  constructor() {
    // Try to load API key from environment
    this.apiKey = process.env.SENTIMENT_API_KEY || null;
  }

  /**
   * Configure the sentiment service with API key
   */
  public configure(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if the service is configured properly
   */
  public isConfigured(): boolean {
    return this.apiKey !== null;
  }

  /**
   * Get sentiment analysis for a crypto symbol
   * @param symbol The crypto symbol (e.g., "BTC", "ETH")
   * @param timeframe The timeframe for analysis (e.g., "15m", "1h", "4h", "1d")
   */
  public async getSentimentAnalysis(symbol: string, timeframe: string = '1h'): Promise<SentimentAnalysisResult> {
    const cacheKey = `${symbol.toUpperCase()}-${timeframe}`;
    const cachedData = this.cachedSentiment.get(cacheKey);
    
    // Return cached data if valid
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_TTL) {
      return cachedData.result;
    }
    
    // If API key isn't set, return mock data
    if (!this.isConfigured()) {
      return this.getMockSentimentData(symbol, timeframe);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/sentiment?symbol=${symbol}&timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Sentiment API error: ${response.status}`);
      }
      
      const data = await response.json();
      const result: SentimentAnalysisResult = {
        symbol,
        timeframe,
        sentimentScore: data.sentimentScore,
        positiveCount: data.positiveCount,
        negativeCount: data.negativeCount, 
        neutralCount: data.neutralCount,
        totalMentions: data.totalMentions,
        topKeywords: data.topKeywords || [],
        volumeChange: data.volumeChange,
        lastUpdated: new Date().toISOString()
      };
      
      // Cache the result
      this.cachedSentiment.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      // Fall back to mock data if API fails
      return this.getMockSentimentData(symbol, timeframe);
    }
  }
  
  /**
   * Get mock sentiment data for development/demo purposes
   * @param symbol Cryptocurrency symbol
   * @param timeframe The timeframe for analysis
   */
  private getMockSentimentData(symbol: string, timeframe: string): SentimentAnalysisResult {
    // Generate somewhat realistic mock data
    const baseScore = Math.random() * 100;
    // Make some coins generally more positive than others for consistency
    const symbolHash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 30;
    const adjustedScore = Math.min(Math.max(baseScore + symbolHash - 15, 0), 100);
    
    const totalMentions = Math.floor(Math.random() * 2000) + 100;
    const positivePercent = adjustedScore / 100;
    const negativePercent = (100 - adjustedScore) / 200; // Half the remaining percentage
    const neutralPercent = 1 - positivePercent - negativePercent;
    
    const positiveCount = Math.floor(totalMentions * positivePercent);
    const negativeCount = Math.floor(totalMentions * negativePercent);
    const neutralCount = totalMentions - positiveCount - negativeCount;
    
    // Generate volume change based on sentiment and timeframe
    // Higher sentiment tends to correlate with higher volume
    let volumeMultiplier = 1;
    switch (timeframe) {
      case '15m':
        volumeMultiplier = 0.5;
        break;
      case '30m':
        volumeMultiplier = 0.75;
        break;
      case '1h':
        volumeMultiplier = 1;
        break;
      case '4h':
        volumeMultiplier = 1.5;
        break;
      case '1d':
        volumeMultiplier = 2;
        break;
    }
    
    const volumeChange = ((adjustedScore / 50) - 1) * volumeMultiplier * 30;
    
    // Generate mock keywords based on sentiment
    const bullishKeywords = ["bullish", "moon", "rally", "buy", "up", "green", "profit", "breakout"];
    const bearishKeywords = ["bearish", "dump", "sell", "down", "red", "loss", "crash"];
    const neutralKeywords = ["hold", "stable", "sideways", "consolidation", "news", "announce"];
    
    let keywordPool;
    if (adjustedScore > 65) {
      keywordPool = [...bullishKeywords, ...neutralKeywords.slice(0, 2)];
    } else if (adjustedScore < 35) {
      keywordPool = [...bearishKeywords, ...neutralKeywords.slice(0, 2)];
    } else {
      keywordPool = [...neutralKeywords, bullishKeywords[0], bearishKeywords[0]];
    }
    
    // Randomly select 5 keywords from the pool
    const topKeywords = Array.from({length: 5}, () => {
      const randomIndex = Math.floor(Math.random() * keywordPool.length);
      return keywordPool[randomIndex];
    });
    
    return {
      symbol,
      timeframe,
      sentimentScore: adjustedScore,
      positiveCount,
      negativeCount,
      neutralCount,
      totalMentions,
      topKeywords,
      volumeChange,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const sentimentService = new SentimentService();
export default sentimentService;