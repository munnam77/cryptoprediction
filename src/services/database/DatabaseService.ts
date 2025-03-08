/**
 * Mock DatabaseService implementation for development
 * This version uses in-memory storage instead of actual database calls
 */

import { TimeframeOption } from '../../config/database.config';

// In-memory storage for mock data
const mockDatabase = {
  rawPriceData: new Map<string, any[]>(),
  timeframeMetrics: new Map<string, any[]>(),
  predictions: new Map<string, any[]>(),
  coinMetadata: new Map<string, any>(),
  topPicks: new Map<string, any>(),
  sentimentData: new Map<string, any[]>()
};

export class DatabaseService {
  /**
   * Store raw price data for a trading pair
   */
  static async storeRawPriceData(
    tradingPair: string,
    price: number,
    volume: number,
    marketCap?: number
  ) {
    const timestamp = Date.now();
    
    try {
      if (!mockDatabase.rawPriceData.has(tradingPair)) {
        mockDatabase.rawPriceData.set(tradingPair, []);
      }
      
      const data = mockDatabase.rawPriceData.get(tradingPair);
      data?.push({
        tradingPair,
        price,
        volume,
        marketCap,
        timestamp
      });
      
      return true;
    } catch (error) {
      console.error(`Error storing raw price data for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Calculate timeframe metrics based on raw data
   */
  static async calculateTimeframeMetrics(
    tradingPair: string,
    timeframe: TimeframeOption
  ) {
    try {
      // Generate mock metrics
      const mockMetric = {
        tradingPair,
        timeframe,
        priceStart: Math.random() * 1000 + 100,
        priceEnd: Math.random() * 1000 + 100,
        priceChangePct: Math.random() * 20 - 10,
        volumeStart: Math.random() * 1000000 + 100000,
        volumeEnd: Math.random() * 1000000 + 100000,
        volumeChangePct: Math.random() * 40 - 20,
        volatilityScore: Math.random() * 100,
        liquidityScore: Math.random() * 100,
        timestamp: Date.now(),
        // Add detailed timeframe metrics
        price_change_pct: Math.random() * 20 - 10,
        price_change_pct_15m: Math.random() * 5 - 2.5,
        price_change_pct_30m: Math.random() * 8 - 4,
        price_change_pct_1h: Math.random() * 12 - 6,
        price_change_pct_4h: Math.random() * 16 - 8,
        price_change_pct_1d: Math.random() * 20 - 10,
        volume_change_pct: Math.random() * 40 - 20,
        volume_change_pct_15m: Math.random() * 10 - 5,
        volume_change_pct_30m: Math.random() * 15 - 7.5,
        volume_change_pct_1h: Math.random() * 20 - 10,
        volume_change_pct_4h: Math.random() * 30 - 15,
        volume_change_pct_1d: Math.random() * 40 - 20,
        volatility_score: Math.random() * 100,
        volatility_15m: Math.random() * 60 + 20,
        volatility_30m: Math.random() * 60 + 20,
        volatility_1h: Math.random() * 60 + 20,
        volatility_4h: Math.random() * 60 + 20,
        volatility_1d: Math.random() * 60 + 20,
        liquidity_score: Math.random() * 100
      };
      
      // Store the mock metrics
      const key = `${tradingPair}_${timeframe}`;
      if (!mockDatabase.timeframeMetrics.has(key)) {
        mockDatabase.timeframeMetrics.set(key, []);
      }
      
      const data = mockDatabase.timeframeMetrics.get(key);
      data?.push(mockMetric);
      
      return mockMetric;
    } catch (error) {
      console.error(`Error calculating ${timeframe} metrics for ${tradingPair}:`, error);
      return null;
    }
  }
  
  /**
   * Get the most recent timeframe metrics for a trading pair
   */
  static async getTimeframeMetrics(
    tradingPair: string,
    timeframe: TimeframeOption
  ) {
    try {
      // If we have stored mock data, return the most recent entry
      const key = `${tradingPair}_${timeframe}`;
      const data = mockDatabase.timeframeMetrics.get(key) || [];
      
      if (data.length > 0) {
        return data[data.length - 1];
      }
      
      // Otherwise, generate and store new mock metrics
      return await this.calculateTimeframeMetrics(tradingPair, timeframe);
    } catch (error) {
      console.error(`Error getting ${timeframe} metrics for ${tradingPair}:`, error);
      return null;
    }
  }
  
  /**
   * Store coin metadata
   */
  static async updateCoinMetadata(
    tradingPair: string,
    name: string,
    ticker: string,
    marketCap: number,
    isTop10: boolean = false
  ) {
    try {
      mockDatabase.coinMetadata.set(tradingPair, {
        tradingPair,
        name,
        ticker,
        marketCap,
        isTop10,
        lastUpdatedAt: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating metadata for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Get trading pairs filtered by market cap range (for low cap gems)
   */
  static async getTradingPairsByMarketCap(
    minMarketCap: number = 10000000,
    maxMarketCap: number = 500000000,
    excludeTop10: boolean = true
  ) {
    try {
      // Filter coin metadata by market cap
      const result = [];
      
      for (const [tradingPair, data] of mockDatabase.coinMetadata.entries()) {
        if (data.marketCap >= minMarketCap && 
            data.marketCap <= maxMarketCap && 
            (!excludeTop10 || !data.isTop10)) {
          result.push(data);
        }
      }
      
      // Generate mock data if we don't have enough
      if (result.length < 5) {
        const mockCoins = [
          { ticker: 'APE', name: 'ApeCoin' },
          { ticker: 'NEAR', name: 'NEAR Protocol' },
          { ticker: 'FTM', name: 'Fantom' },
          { ticker: 'ALGO', name: 'Algorand' },
          { ticker: 'GALA', name: 'Gala' },
          { ticker: 'CRO', name: 'Cronos' },
          { ticker: 'LRC', name: 'Loopring' },
          { ticker: 'BAT', name: 'Basic Attention Token' },
          { ticker: 'ZRX', name: '0x' },
          { ticker: 'ENJ', name: 'Enjin Coin' }
        ];
        
        for (const coin of mockCoins) {
          const tradingPair = `${coin.ticker}/USDT`;
          const marketCap = minMarketCap + Math.random() * (maxMarketCap - minMarketCap);
          
          result.push({
            trading_pair: tradingPair,
            name: coin.name,
            ticker: coin.ticker,
            market_cap: marketCap
          });
          
          // Also store in our mock database
          mockDatabase.coinMetadata.set(tradingPair, {
            tradingPair,
            name: coin.name,
            ticker: coin.ticker,
            marketCap,
            isTop10: false,
            lastUpdatedAt: Date.now()
          });
        }
      }
      
      // Sort by market cap (descending)
      result.sort((a, b) => (b.market_cap || b.marketCap) - (a.market_cap || a.marketCap));
      
      return result;
    } catch (error) {
      console.error('Error getting trading pairs by market cap:', error);
      return [];
    }
  }
  
  /**
   * Save a prediction for a trading pair in a specific timeframe
   */
  static async savePrediction(
    tradingPair: string,
    timeframe: TimeframeOption,
    predictedChangePct: number,
    confidenceScore: number
  ) {
    const timestamp = Date.now();
    
    try {
      const key = `${tradingPair}_${timeframe}`;
      if (!mockDatabase.predictions.has(key)) {
        mockDatabase.predictions.set(key, []);
      }
      
      const data = mockDatabase.predictions.get(key);
      const predictionId = data?.length || 0;
      
      data?.push({
        id: predictionId,
        tradingPair,
        timeframe,
        predictedChangePct,
        confidenceScore,
        predictionTimestamp: timestamp,
        evaluationTimestamp: null,
        actualChangePct: null,
        wasAccurate: null
      });
      
      return true;
    } catch (error) {
      console.error(`Error saving prediction for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Update a prediction with actual results
   */
  static async updatePredictionResult(
    id: number,
    actualChangePct: number,
    wasAccurate: boolean
  ) {
    try {
      // Find prediction by ID
      for (const [key, predictions] of mockDatabase.predictions.entries()) {
        const predIndex = predictions.findIndex(p => p.id === id);
        
        if (predIndex !== -1) {
          predictions[predIndex].actualChangePct = actualChangePct;
          predictions[predIndex].wasAccurate = wasAccurate;
          predictions[predIndex].evaluationTimestamp = Date.now();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating prediction result for ID ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Get top predictions for a specific timeframe
   */
  static async getTopPredictions(
    timeframe: TimeframeOption,
    limit: number = 5
  ) {
    try {
      // Gather all predictions for the specified timeframe
      const allPredictions = [];
      
      for (const [key, predictions] of mockDatabase.predictions.entries()) {
        if (key.includes(`_${timeframe}`)) {
          const filtered = predictions.filter(p => p.evaluationTimestamp === null);
          allPredictions.push(...filtered);
        }
      }
      
      // If we don't have enough, generate mock predictions
      if (allPredictions.length < limit) {
        const mockTradingPairs = [
          'APE/USDT', 'NEAR/USDT', 'FTM/USDT', 'ALGO/USDT', 
          'GALA/USDT', 'CRO/USDT', 'LRC/USDT', 'BAT/USDT', 
          'ZRX/USDT', 'ENJ/USDT'
        ];
        
        for (const pair of mockTradingPairs) {
          const prediction = {
            id: Math.floor(Math.random() * 1000),
            trading_pair: pair,
            timeframe,
            predicted_change_pct: Math.random() * 20 - 5, // Bias toward positive predictions
            confidence_score: Math.floor(Math.random() * 40) + 60, // 60-100%
            prediction_timestamp: Date.now() - Math.random() * 86400000,
            evaluation_timestamp: null,
            actual_change_pct: null,
            was_accurate: null,
            name: pair.split('/')[0],
            ticker: pair.split('/')[0],
            market_cap: Math.random() * 490000000 + 10000000 // $10M-$500M
          };
          
          allPredictions.push(prediction);
        }
      }
      
      // Sort by predicted change (descending) and confidence
      allPredictions.sort((a, b) => {
        const changeA = a.predicted_change_pct || a.predictedChangePct;
        const changeB = b.predicted_change_pct || b.predictedChangePct;
        const confA = a.confidence_score || a.confidenceScore;
        const confB = b.confidence_score || b.confidenceScore;
        
        if (changeB === changeA) {
          return confB - confA;
        }
        return changeB - changeA;
      });
      
      // Return top predictions
      return allPredictions.slice(0, limit);
    } catch (error) {
      console.error(`Error getting top predictions for ${timeframe}:`, error);
      return [];
    }
  }
  
  /**
   * Add or update a top pick (low cap gem)
   */
  static async updateTopPick(
    tradingPair: string,
    marketCap: number,
    selectionReason: string,
    predictedPeakTimeframe: TimeframeOption,
    predictionConfidence: number
  ) {
    try {
      mockDatabase.topPicks.set(tradingPair, {
        tradingPair,
        marketCap,
        selectionReason,
        predictedPeakTimeframe,
        predictionConfidence,
        selectedAt: Date.now(),
        isActive: true
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating top pick for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Get current active top picks (low cap gems)
   */
  static async getTopPicks(limit: number = 10) {
    try {
      // Get top picks from our mock database
      const picks = Array.from(mockDatabase.topPicks.values());
      
      // Generate mock data if we don't have enough
      if (picks.length < limit) {
        const mockPicks = [
          { ticker: 'APE', name: 'ApeCoin', reason: 'Strong momentum and NFT utility growth' },
          { ticker: 'NEAR', name: 'NEAR Protocol', reason: 'Growing ecosystem and scaling solutions' },
          { ticker: 'FTM', name: 'Fantom', reason: 'Technical breakout on low fees' },
          { ticker: 'ALGO', name: 'Algorand', reason: 'Institutional partnerships forming' },
          { ticker: 'GALA', name: 'Gala', reason: 'Gaming sector rotation upcoming' },
          { ticker: 'CRO', name: 'Cronos', reason: 'Exchange token momentum building' },
          { ticker: 'LRC', name: 'Loopring', reason: 'L2 solution gaining adoption' },
          { ticker: 'BAT', name: 'Basic Attention Token', reason: 'Ad platform expansion' },
          { ticker: 'ZRX', name: '0x', reason: 'DEX aggregator benefits from volume increase' },
          { ticker: 'ENJ', name: 'Enjin Coin', reason: 'NFT gaming sector growth' }
        ];
        
        for (const pick of mockPicks) {
          const tradingPair = `${pick.ticker}/USDT`;
          
          if (!mockDatabase.topPicks.has(tradingPair)) {
            const timeframes: TimeframeOption[] = ['15m', '30m', '1h', '4h', '1d'];
            const predConfidence = 75 + Math.floor(Math.random() * 20);
            const peakTimeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
            
            picks.push({
              trading_pair: tradingPair,
              market_cap: Math.random() * 490000000 + 10000000,
              selection_reason: pick.reason,
              predicted_peak_timeframe: peakTimeframe,
              prediction_confidence: predConfidence,
              selected_at: Date.now() - Math.random() * 86400000 * 5, // 0-5 days ago
              is_active: true,
              name: pick.name,
              ticker: pick.ticker
            });
            
            // Also store in our mock database
            mockDatabase.topPicks.set(tradingPair, {
              tradingPair,
              marketCap: Math.random() * 490000000 + 10000000,
              selectionReason: pick.reason,
              predictedPeakTimeframe: peakTimeframe,
              predictionConfidence: predConfidence,
              selectedAt: Date.now() - Math.random() * 86400000 * 5,
              isActive: true
            });
          }
        }
      }
      
      // Sort by prediction confidence (descending)
      picks.sort((a, b) => {
        const confA = a.prediction_confidence || a.predictionConfidence;
        const confB = b.prediction_confidence || b.predictionConfidence;
        return confB - confA;
      });
      
      return picks.slice(0, limit);
    } catch (error) {
      console.error('Error getting top picks:', error);
      return [];
    }
  }
  
  /**
   * Store sentiment data for a trading pair
   */
  static async storeSentimentData(
    tradingPair: string,
    sentimentScore: number,
    source: string,
    postCount?: number
  ) {
    try {
      const key = `${tradingPair}_${source}`;
      if (!mockDatabase.sentimentData.has(key)) {
        mockDatabase.sentimentData.set(key, []);
      }
      
      const data = mockDatabase.sentimentData.get(key);
      data?.push({
        tradingPair,
        sentimentScore,
        source,
        postCount: postCount || Math.floor(Math.random() * 1000) + 100,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error(`Error storing sentiment data for ${tradingPair}:`, error);
      return false;
    }
  }
}