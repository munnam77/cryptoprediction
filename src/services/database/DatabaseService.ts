import { db } from '../../config/database.config';
import { initializeDatabase, createIndexes } from '../../config/database.schema';
import { TimeframeOption, TIMEFRAME_OPTIONS, DB_CONFIG } from '../../config/database.config';

export class DatabaseService {
  private static instance: DatabaseService;
  private static db: any; // Replace with your actual database client

  private constructor() {
    // Private constructor to prevent direct instantiation
    DatabaseService.db = null; // Initialize your database connection here
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async getPredictionsInTimeRange(
    timeframe: string,
    startTime: number,
    endTime: number
  ) {
    try {
      const predictions = await DatabaseService.db.query(`
        SELECT *
        FROM predictions
        WHERE timeframe = $1
          AND timestamp BETWEEN $2 AND $3
        ORDER BY timestamp DESC
      `, [timeframe, startTime, endTime]);

      return predictions.rows;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }
  }

  async getPredictionHistory(symbol: string, timeframe: string) {
    try {
      const history = await DatabaseService.db.query(`
        SELECT *
        FROM predictions
        WHERE symbol = $1
          AND timeframe = $2
        ORDER BY timestamp DESC
        LIMIT 100
      `, [symbol, timeframe]);

      return history.rows;
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      return [];
    }
  }

  async getLastSyncTime(timeframe: TimeframeOption): Promise<number> {
    try {
      const result = await DatabaseService.db.query(`
        SELECT MAX(timestamp) as last_sync
        FROM sync_history
        WHERE timeframe = $1
      `, [timeframe]);

      return result.rows[0]?.last_sync || 0;
    } catch (error) {
      console.error('Error fetching last sync time:', error);
      return 0;
    }
  }

  /**
   * Initialize the database with required tables and indexes
   */
  static async initialize() {
    try {
      await initializeDatabase(db);
      await createIndexes(db);
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  /**
   * Store raw price data for a trading pair
   * @param tradingPair Trading pair symbol (e.g., 'SOL/USDT')
   * @param price Current price
   * @param volume Current volume
   * @param marketCap Market capitalization
   */
  static async storeRawPriceData(
    tradingPair: string,
    price: number,
    volume: number,
    marketCap?: number
  ) {
    const timestamp = Date.now();
    
    try {
      await db.sql`
        INSERT INTO raw_price_data (trading_pair, price, volume, market_cap, timestamp)
        VALUES (${tradingPair}, ${price}, ${volume}, ${marketCap || null}, ${timestamp})
        ON CONFLICT (trading_pair, timestamp)
        DO UPDATE SET 
          price = ${price},
          volume = ${volume},
          market_cap = ${marketCap || null}
      `;
      return true;
    } catch (error) {
      console.error(`Error storing raw price data for ${tradingPair}:`, error);
      return false;
    }
  }

  /**
   * Calculate timeframe metrics based on raw data
   * @param tradingPair Trading pair symbol
   * @param timeframe Timeframe to calculate metrics for
   */
  static async calculateTimeframeMetrics(
    tradingPair: string,
    timeframe: TimeframeOption
  ) {
    const currentTimestamp = Date.now();
    const timeframeMs = DB_CONFIG.TIMEFRAMES[timeframe];
    const startTimestamp = currentTimestamp - timeframeMs;
    
    try {
      // Get start and end data points
      const startData = await db.sql`
        SELECT price, volume
        FROM raw_price_data
        WHERE trading_pair = ${tradingPair}
          AND timestamp <= ${startTimestamp}
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      
      const endData = await db.sql`
        SELECT price, volume, market_cap
        FROM raw_price_data
        WHERE trading_pair = ${tradingPair}
          AND timestamp <= ${currentTimestamp}
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      
      // If we don't have both data points, we can't calculate metrics
      if (startData.rows.length === 0 || endData.rows.length === 0) {
        return null;
      }
      
      const startPrice = parseFloat(startData.rows[0].price);
      const endPrice = parseFloat(endData.rows[0].price);
      const startVolume = parseFloat(startData.rows[0].volume);
      const endVolume = parseFloat(endData.rows[0].volume);
      const marketCap = endData.rows[0].market_cap ? parseFloat(endData.rows[0].market_cap) : null;
      
      // Calculate price change percentage
      const priceChangePct = ((endPrice - startPrice) / startPrice) * 100;
      
      // Calculate volume change percentage (handle division by zero)
      let volumeChangePct = null;
      if (startVolume > 0) {
        volumeChangePct = ((endVolume - startVolume) / startVolume) * 100;
      }
      
      // Calculate volatility score (simplified version - we'd use a more sophisticated algorithm in production)
      const volatilityScore = await this.calculateVolatilityScore(tradingPair, timeframe);
      
      // Calculate liquidity score (simplified version)
      const liquidityScore = await this.calculateLiquidityScore(tradingPair, endVolume, marketCap);
      
      // Store calculated metrics
      await db.sql`
        INSERT INTO timeframe_metrics (
          trading_pair, timeframe, price_start, price_end, price_change_pct,
          volume_start, volume_end, volume_change_pct, volatility_score, 
          liquidity_score, timestamp
        )
        VALUES (
          ${tradingPair}, ${timeframe}, ${startPrice}, ${endPrice}, ${priceChangePct},
          ${startVolume}, ${endVolume}, ${volumeChangePct}, ${volatilityScore},
          ${liquidityScore}, ${currentTimestamp}
        )
        ON CONFLICT (trading_pair, timeframe, timestamp)
        DO UPDATE SET
          price_start = ${startPrice},
          price_end = ${endPrice},
          price_change_pct = ${priceChangePct},
          volume_start = ${startVolume},
          volume_end = ${endVolume},
          volume_change_pct = ${volumeChangePct},
          volatility_score = ${volatilityScore},
          liquidity_score = ${liquidityScore}
      `;
      
      return {
        tradingPair,
        timeframe,
        priceStart: startPrice,
        priceEnd: endPrice,
        priceChangePct,
        volumeStart: startVolume,
        volumeEnd: endVolume,
        volumeChangePct,
        volatilityScore,
        liquidityScore,
        timestamp: currentTimestamp
      };
    } catch (error) {
      console.error(`Error calculating ${timeframe} metrics for ${tradingPair}:`, error);
      return null;
    }
  }
  
  /**
   * Calculate volatility score based on price movements in the timeframe
   * @param tradingPair Trading pair symbol
   * @param timeframe Timeframe to analyze
   */
  private static async calculateVolatilityScore(
    tradingPair: string,
    timeframe: TimeframeOption
  ): Promise<number> {
    const currentTimestamp = Date.now();
    const timeframeMs = DB_CONFIG.TIMEFRAMES[timeframe];
    const startTimestamp = currentTimestamp - timeframeMs;
    
    try {
      // Get price data points within the timeframe
      const priceData = await db.sql`
        SELECT price
        FROM raw_price_data
        WHERE trading_pair = ${tradingPair}
          AND timestamp BETWEEN ${startTimestamp} AND ${currentTimestamp}
        ORDER BY timestamp ASC
      `;
      
      if (priceData.rows.length < 2) {
        return 50; // Default neutral score if insufficient data
      }
      
      // Calculate standard deviation of percent changes between adjacent prices
      const prices = priceData.rows.map(row => parseFloat(row.price));
      const pctChanges = [];
      
      for (let i = 1; i < prices.length; i++) {
        const pctChange = ((prices[i] - prices[i-1]) / prices[i-1]) * 100;
        pctChanges.push(pctChange);
      }
      
      const mean = pctChanges.reduce((sum, val) => sum + val, 0) / pctChanges.length;
      const variance = pctChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pctChanges.length;
      const stdDev = Math.sqrt(variance);
      
      // Convert standard deviation to a 0-100 score
      // This is a simplified approach - adjust scaling factors based on historical data
      const volatilityScore = Math.min(100, Math.max(0, stdDev * 10));
      
      return Number(volatilityScore.toFixed(2));
    } catch (error) {
      console.error(`Error calculating volatility score for ${tradingPair}:`, error);
      return 50; // Default neutral score on error
    }
  }
  
  /**
   * Calculate liquidity score based on volume and market cap
   * @param tradingPair Trading pair symbol
   * @param volume Current trading volume
   * @param marketCap Market capitalization
   */
  private static async calculateLiquidityScore(
    tradingPair: string,
    volume: number,
    marketCap: number | null
  ): Promise<number> {
    try {
      if (!marketCap || marketCap === 0) {
        // If no market cap data, use only volume-based calculation
        // Compare to median volume of all trading pairs
        const medianVolumeData = await db.sql`
          SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY volume) as median_volume
          FROM raw_price_data
          WHERE timestamp > ${Date.now() - 24 * 60 * 60 * 1000}
        `;
        
        const medianVolume = parseFloat(medianVolumeData.rows[0].median_volume || '0');
        
        if (medianVolume === 0) return 50;
        
        // Score based on how volume compares to median
        const volumeRatio = volume / medianVolume;
        return Math.min(100, Math.max(0, volumeRatio * 50));
      }
      
      // With market cap available, use volume/market cap ratio
      // Higher ratio = higher liquidity score
      const volumeToMarketCapRatio = (volume / marketCap) * 100;
      
      // Scale to 0-100 score (adjust the multiplier based on typical ratios)
      const liquidityScore = Math.min(100, Math.max(0, volumeToMarketCapRatio * 200));
      
      return Number(liquidityScore.toFixed(2));
    } catch (error) {
      console.error(`Error calculating liquidity score for ${tradingPair}:`, error);
      return 50; // Default neutral score on error
    }
  }
  
  /**
   * Get the most recent timeframe metrics for a trading pair
   * @param tradingPair Trading pair symbol
   * @param timeframe Timeframe to get metrics for
   */
  static async getTimeframeMetrics(
    tradingPair: string,
    timeframe: TimeframeOption
  ) {
    try {
      const result = await db.sql`
        SELECT * FROM timeframe_metrics
        WHERE trading_pair = ${tradingPair}
          AND timeframe = ${timeframe}
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting ${timeframe} metrics for ${tradingPair}:`, error);
      return null;
    }
  }
  
  /**
   * Store coin metadata
   * @param tradingPair Trading pair symbol
   * @param name Full name of the coin
   * @param ticker Ticker symbol
   * @param marketCap Market capitalization
   * @param isTop10 Whether the coin is in the top 10 by market cap
   */
  static async updateCoinMetadata(
    tradingPair: string,
    name: string,
    ticker: string,
    marketCap: number,
    isTop10: boolean = false
  ) {
    const timestamp = Date.now();
    
    try {
      await db.sql`
        INSERT INTO coin_metadata (
          trading_pair, name, ticker, market_cap, is_top_10, last_updated_at
        )
        VALUES (
          ${tradingPair}, ${name}, ${ticker}, ${marketCap}, ${isTop10}, ${timestamp}
        )
        ON CONFLICT (trading_pair)
        DO UPDATE SET
          name = ${name},
          ticker = ${ticker},
          market_cap = ${marketCap},
          is_top_10 = ${isTop10},
          last_updated_at = ${timestamp}
      `;
      return true;
    } catch (error) {
      console.error(`Error updating metadata for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Get trading pairs filtered by market cap range (for low cap gems)
   * @param minMarketCap Minimum market cap (default $10M)
   * @param maxMarketCap Maximum market cap (default $500M)
   * @param excludeTop10 Whether to exclude top 10 coins by market cap
   */
  static async getTradingPairsByMarketCap(
    minMarketCap: number = DB_CONFIG.MARKET_CAP.MIN,
    maxMarketCap: number = DB_CONFIG.MARKET_CAP.MAX,
    excludeTop10: boolean = true
  ) {
    try {
      let query = `
        SELECT trading_pair, name, ticker, market_cap
        FROM coin_metadata
        WHERE market_cap BETWEEN ${minMarketCap} AND ${maxMarketCap}
      `;
      
      if (excludeTop10) {
        query += ` AND is_top_10 = false`;
      }
      
      query += ` ORDER BY market_cap DESC`;
      
      const result = await db.sql`${query}`;
      return result.rows;
    } catch (error) {
      console.error('Error getting trading pairs by market cap:', error);
      return [];
    }
  }
  
  /**
   * Save a prediction for a trading pair in a specific timeframe
   * @param tradingPair Trading pair symbol
   * @param timeframe Prediction timeframe
   * @param predictedChangePct Predicted price change percentage
   * @param confidenceScore Confidence in the prediction (0-100)
   */
  static async savePrediction(
    tradingPair: string,
    timeframe: TimeframeOption,
    predictedChangePct: number,
    confidenceScore: number
  ) {
    const timestamp = Date.now();
    
    try {
      await db.sql`
        INSERT INTO predictions (
          trading_pair, timeframe, predicted_change_pct, confidence_score, prediction_timestamp
        )
        VALUES (
          ${tradingPair}, ${timeframe}, ${predictedChangePct}, ${confidenceScore}, ${timestamp}
        )
      `;
      return true;
    } catch (error) {
      console.error(`Error saving prediction for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Update a prediction with actual results
   * @param id Prediction ID to update
   * @param actualChangePct Actual price change percentage
   * @param wasAccurate Whether prediction was accurate (within threshold)
   */
  static async updatePredictionResult(
    id: number,
    actualChangePct: number,
    wasAccurate: boolean
  ) {
    const evaluationTimestamp = Date.now();
    
    try {
      await db.sql`
        UPDATE predictions
        SET 
          actual_change_pct = ${actualChangePct},
          was_accurate = ${wasAccurate},
          evaluation_timestamp = ${evaluationTimestamp}
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error(`Error updating prediction result for ID ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Get top predictions for a specific timeframe
   * @param timeframe Prediction timeframe
   * @param limit Number of predictions to return
   */
  static async getTopPredictions(
    timeframe: TimeframeOption,
    limit: number = 5
  ) {
    try {
      const result = await db.sql`
        SELECT 
          p.*,
          c.name,
          c.ticker,
          c.market_cap
        FROM predictions p
        JOIN coin_metadata c ON p.trading_pair = c.trading_pair
        WHERE 
          p.timeframe = ${timeframe}
          AND p.evaluation_timestamp IS NULL
          AND c.is_top_10 = false
        ORDER BY 
          p.predicted_change_pct DESC,
          p.confidence_score DESC
        LIMIT ${limit}
      `;
      
      return result.rows;
    } catch (error) {
      console.error(`Error getting top predictions for ${timeframe}:`, error);
      return [];
    }
  }
  
  /**
   * Add or update a top pick (low cap gem)
   * @param tradingPair Trading pair symbol
   * @param marketCap Market capitalization
   * @param selectionReason Reason for selection
   * @param predictedPeakTimeframe Timeframe with highest predicted performance
   * @param predictionConfidence Confidence in the prediction
   */
  static async updateTopPick(
    tradingPair: string,
    marketCap: number,
    selectionReason: string,
    predictedPeakTimeframe: TimeframeOption,
    predictionConfidence: number
  ) {
    const timestamp = Date.now();
    
    try {
      await db.sql`
        INSERT INTO top_picks (
          trading_pair, market_cap, selection_reason, 
          predicted_peak_timeframe, prediction_confidence, selected_at, is_active
        )
        VALUES (
          ${tradingPair}, ${marketCap}, ${selectionReason}, 
          ${predictedPeakTimeframe}, ${predictionConfidence}, ${timestamp}, true
        )
        ON CONFLICT (trading_pair, is_active)
        DO UPDATE SET
          market_cap = ${marketCap},
          selection_reason = ${selectionReason},
          predicted_peak_timeframe = ${predictedPeakTimeframe},
          prediction_confidence = ${predictionConfidence},
          selected_at = ${timestamp}
      `;
      return true;
    } catch (error) {
      console.error(`Error updating top pick for ${tradingPair}:`, error);
      return false;
    }
  }
  
  /**
   * Get current active top picks (low cap gems)
   * @param limit Number of top picks to return
   */
  static async getTopPicks(limit: number = 10) {
    try {
      const result = await db.sql`
        SELECT tp.*, c.name, c.ticker
        FROM top_picks tp
        JOIN coin_metadata c ON tp.trading_pair = c.trading_pair
        WHERE tp.is_active = true
        ORDER BY tp.prediction_confidence DESC
        LIMIT ${limit}
      `;
      
      return result.rows;
    } catch (error) {
      console.error('Error getting top picks:', error);
      return [];
    }
  }
  
  /**
   * Store sentiment data for a trading pair
   * @param tradingPair Trading pair symbol
   * @param sentimentScore Sentiment score (-100 to 100)
   * @param source Source of sentiment (e.g., 'twitter', 'news')
   * @param postCount Number of posts analyzed
   */
  static async storeSentimentData(
    tradingPair: string,
    sentimentScore: number,
    source: string,
    postCount?: number
  ) {
    const timestamp = Date.now();
    
    try {
      await db.sql`
        INSERT INTO sentiment_data (
          trading_pair, sentiment_score, source, post_count, timestamp
        )
        VALUES (
          ${tradingPair}, ${sentimentScore}, ${source}, ${postCount || null}, ${timestamp}
        )
        ON CONFLICT (trading_pair, source, timestamp)
        DO UPDATE SET
          sentiment_score = ${sentimentScore},
          post_count = ${postCount || null}
      `;
      return true;
    } catch (error) {
      console.error(`Error storing sentiment data for ${tradingPair}:`, error);
      return false;
    }
  }
}