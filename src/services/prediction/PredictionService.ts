import { DatabaseService } from '../database/DatabaseService';
import { BinanceService } from '../binance/BinanceService';
import { DB_CONFIG, TimeframeOption } from '../../config/database.config';

interface TimeframePrediction {
  tradingPair: string;
  predictedChangePct: number;
  confidenceScore: number;
  timeframe: TimeframeOption;
  predictionTimestamp: number;
}

/**
 * Service to handle crypto price predictions across multiple timeframes
 */
export class PredictionService {
  // Keep track of when predictions were last generated for each timeframe
  private static lastPredictionTimes: Record<TimeframeOption, number> = {
    '15m': 0,
    '30m': 0,
    '1h': 0,
    '4h': 0,
    '1d': 0,
  };

  /**
   * Initialize the prediction service
   */
  static async initialize() {
    try {
      // Set up initial prediction schedule
      console.log('PredictionService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize PredictionService:', error);
      return false;
    }
  }

  /**
   * Generate predictions for a specific timeframe
   * @param timeframe Timeframe to generate predictions for
   */
  static async generatePredictions(timeframe: TimeframeOption) {
    const now = Date.now();
    
    // Check if we need to generate new predictions based on timeframe
    if (!this.shouldGeneratePrediction(timeframe, now)) {
      console.log(`Skipping prediction generation for ${timeframe}, not time yet`);
      return null;
    }
    
    try {
      console.log(`Generating predictions for ${timeframe} timeframe...`);
      
      // Get trading pairs within our market cap range, excluding top 10
      const tradingPairs = await BinanceService.getTradingPairs(
        DB_CONFIG.MARKET_CAP.MIN,
        DB_CONFIG.MARKET_CAP.MAX
      );
      
      const predictions: TimeframePrediction[] = [];
      
      for (const tradingPair of tradingPairs) {
        // Get historical data for this trading pair
        const klines = await BinanceService.getKlineData(tradingPair, timeframe, 100);
        
        if (klines.length < 50) {
          // Skip pairs with insufficient data
          continue;
        }
        
        // Get timeframe metrics
        const metrics = await DatabaseService.getTimeframeMetrics(tradingPair, timeframe);
        
        // Skip if we don't have metrics
        if (!metrics) continue;
        
        // Calculate prediction
        // Note: This is a simple placeholder algorithm
        // A real implementation would use ML models from TransformerModel or LSTMModel
        const { predictedChangePct, confidenceScore } = this.calculatePrediction(
          klines,
          metrics,
          timeframe
        );
        
        // Store prediction in database
        await DatabaseService.savePrediction(
          tradingPair,
          timeframe,
          predictedChangePct,
          confidenceScore
        );
        
        predictions.push({
          tradingPair,
          predictedChangePct,
          confidenceScore,
          timeframe,
          predictionTimestamp: now
        });
      }
      
      // Update last prediction time for this timeframe
      this.lastPredictionTimes[timeframe] = now;
      
      // Sort by predicted change percentage (descending)
      const sortedPredictions = predictions.sort(
        (a, b) => b.predictedChangePct - a.predictedChangePct
      );
      
      return sortedPredictions;
    } catch (error) {
      console.error(`Error generating predictions for ${timeframe}:`, error);
      return null;
    }
  }
  
  /**
   * Check if we should generate a new prediction for a timeframe
   * @param timeframe The timeframe to check
   * @param now Current timestamp
   */
  private static shouldGeneratePrediction(timeframe: TimeframeOption, now: number): boolean {
    const lastPrediction = this.lastPredictionTimes[timeframe];
    const timeframeMs = DB_CONFIG.TIMEFRAMES[timeframe];
    
    // For 1d, we want to predict at 9:00 AM JST (00:00 UTC)
    if (timeframe === '1d') {
      const date = new Date(now);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      // Only generate at 00:00-00:10 UTC and if we haven't generated today
      const isRightTime = hours === 0 && minutes < 10;
      const lastPredDate = new Date(lastPrediction);
      const isSameDay = lastPredDate.toDateString() === date.toDateString();
      
      return isRightTime && !isSameDay;
    }
    
    // For other timeframes, check if enough time has passed
    return (now - lastPrediction) >= timeframeMs;
  }
  
  /**
   * Calculate price prediction and confidence score
   * @param klines Historical price data
   * @param metrics Timeframe metrics
   * @param timeframe The timeframe being predicted
   */
  private static calculatePrediction(
    klines: any[],
    metrics: any,
    timeframe: TimeframeOption
  ): { predictedChangePct: number; confidenceScore: number } {
    // Extract price data
    const prices = klines.map(k => k.close);
    const volumes = klines.map(k => k.volume);
    
    // Get recent volatility
    const volatility = metrics.volatility_score || 50;
    
    // Calculate simple moving averages
    const sma9 = this.calculateSMA(prices, 9);
    const sma21 = this.calculateSMA(prices, 21);
    const volumeSMA5 = this.calculateSMA(volumes, 5);
    
    // Determine trend direction
    const isBullish = sma9 > sma21;
    const volumeIncreasing = volumes[volumes.length - 1] > volumeSMA5;
    
    // Basic prediction logic (simplified for this example)
    // In a real implementation, we would use ML models instead
    let predictedChangePct = 0;
    let confidenceScore = 0;
    
    if (isBullish && volumeIncreasing) {
      // Bullish scenario
      predictedChangePct = 2 + Math.random() * 8; // 2-10% positive
      confidenceScore = 60 + Math.random() * 25; // 60-85% confidence
    } else if (!isBullish && volumeIncreasing) {
      // Mixed signals
      predictedChangePct = -2 + Math.random() * 4; // -2 to +2%
      confidenceScore = 40 + Math.random() * 20; // 40-60% confidence
    } else if (isBullish && !volumeIncreasing) {
      // Mixed signals
      predictedChangePct = 0 + Math.random() * 5; // 0-5% positive
      confidenceScore = 50 + Math.random() * 15; // 50-65% confidence
    } else {
      // Bearish scenario
      predictedChangePct = -5 - Math.random() * 5; // -5 to -10% negative
      confidenceScore = 55 + Math.random() * 25; // 55-80% confidence
    }
    
    // Adjust based on volatility
    if (volatility > 70) {
      // High volatility increases magnitude but decreases confidence
      predictedChangePct *= 1.5;
      confidenceScore *= 0.85;
    } else if (volatility < 30) {
      // Low volatility decreases magnitude but increases confidence
      predictedChangePct *= 0.7;
      confidenceScore *= 1.1;
    }
    
    // Cap confidence score at 95%
    confidenceScore = Math.min(95, confidenceScore);
    
    return {
      predictedChangePct: Number(predictedChangePct.toFixed(2)),
      confidenceScore: Number(confidenceScore.toFixed(2))
    };
  }
  
  /**
   * Calculate Simple Moving Average
   * @param data Array of values
   * @param period Period for the SMA
   */
  private static calculateSMA(data: number[], period: number): number {
    if (data.length < period) {
      return NaN;
    }
    
    const values = data.slice(-period);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / period;
  }
  
  /**
   * Get top predictions for all timeframes
   * @param limit Number of top predictions to return per timeframe
   */
  static async getTopPredictionsAllTimeframes(limit: number = 5) {
    try {
      const result: Record<TimeframeOption, any[]> = {} as any;
      
      for (const timeframe of Object.keys(this.lastPredictionTimes) as TimeframeOption[]) {
        const predictions = await DatabaseService.getTopPredictions(timeframe, limit);
        result[timeframe] = predictions;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting top predictions for all timeframes:', error);
      return null;
    }
  }
  
  /**
   * Generate predictions for all timeframes
   */
  static async generateAllTimeframePredictions() {
    const results: Record<TimeframeOption, TimeframePrediction[] | null> = {} as any;
    
    for (const timeframe of Object.keys(this.lastPredictionTimes) as TimeframeOption[]) {
      results[timeframe] = await this.generatePredictions(timeframe);
    }
    
    return results;
  }
  
  /**
   * Update the top picks (low cap gems) based on predictions across all timeframes
   * @param limit Number of top picks to select
   */
  static async updateTopPicks(limit: number = 10) {
    try {
      // Get predictions from all timeframes
      const allPredictions = await this.getTopPredictionsAllTimeframes(20);
      
      // Combine and score all predictions
      const combinedScores: Record<string, {
        tradingPair: string;
        marketCap: number;
        totalScore: number;
        bestTimeframe: TimeframeOption;
        bestPrediction: number;
        bestConfidence: number;
        selectionReason: string;
      }> = {};
      
      // Process predictions from each timeframe
      for (const [timeframe, predictions] of Object.entries(allPredictions) as [TimeframeOption, any[]][]) {
        for (const pred of predictions) {
          const tradingPair = pred.trading_pair;
          const marketCap = pred.market_cap;
          
          // Skip if market cap is outside our range
          if (!marketCap || 
              marketCap < DB_CONFIG.MARKET_CAP.MIN || 
              marketCap > DB_CONFIG.MARKET_CAP.MAX) {
            continue;
          }
          
          const predictionScore = pred.predicted_change_pct;
          const confidenceScore = pred.confidence_score;
          
          // Calculate weighted score
          const score = predictionScore * (confidenceScore / 100);
          
          if (!combinedScores[tradingPair] || 
              score > combinedScores[tradingPair].totalScore) {
            // Create or update entry with higher score
            combinedScores[tradingPair] = {
              tradingPair,
              marketCap,
              totalScore: score,
              bestTimeframe: timeframe,
              bestPrediction: predictionScore,
              bestConfidence: confidenceScore,
              selectionReason: `Predicted to rise ${predictionScore.toFixed(2)}% in the next ${timeframe} with ${confidenceScore.toFixed(0)}% confidence`
            };
          }
        }
      }
      
      // Convert to array and sort by total score
      const sortedPicks = Object.values(combinedScores)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);
      
      // Update top picks in database
      for (const pick of sortedPicks) {
        await DatabaseService.updateTopPick(
          pick.tradingPair,
          pick.marketCap,
          pick.selectionReason,
          pick.bestTimeframe,
          pick.bestConfidence
        );
      }
      
      return sortedPicks;
    } catch (error) {
      console.error('Error updating top picks:', error);
      return [];
    }
  }
}
