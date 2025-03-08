import { BinanceService } from '../binance/BinanceService';
import { CacheService } from '../cache/CacheService';
import { DatabaseService } from '../database/DatabaseService';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';

export interface ValidationRule {
  field: string;
  type: 'number' | 'string' | 'boolean' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

export class DataValidationService {
  private static instance: DataValidationService;
  private performanceMonitor: PerformanceMonitor;
  private rules: Map<string, ValidationRule[]> = new Map();

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.setupDefaultRules();
  }

  public static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  private setupDefaultRules(): void {
    // Price data validation rules
    this.addRules('price', [
      {
        field: 'value',
        type: 'number',
        required: true,
        min: 0,
        custom: (value) => !isNaN(value) && isFinite(value)
      },
      {
        field: 'timestamp',
        type: 'number',
        required: true,
        custom: (value) => value > 0 && value <= Date.now()
      }
    ]);

    // Prediction data validation rules
    this.addRules('prediction', [
      {
        field: 'value',
        type: 'number',
        required: true,
        custom: (value) => !isNaN(value) && isFinite(value)
      },
      {
        field: 'confidence',
        type: 'number',
        required: true,
        min: 0,
        max: 100
      }
    ]);

    // Market data validation rules
    this.addRules('market', [
      {
        field: 'symbol',
        type: 'string',
        required: true,
        pattern: /^[A-Z0-9]+$/
      },
      {
        field: 'volume',
        type: 'number',
        required: true,
        min: 0
      }
    ]);
  }

  addRules(type: string, rules: ValidationRule[]): void {
    this.rules.set(type, rules);
  }

  validate(type: string, data: any): ValidationResult {
    const rules = this.rules.get(type);
    if (!rules) {
      return {
        isValid: false,
        errors: [{ field: 'type', message: `No validation rules found for type: ${type}` }]
      };
    }

    const errors: { field: string; message: string }[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`
        });
        return;
      }

      if (value === undefined || value === null) {
        return;
      }

      // Type checking
      if (typeof value !== rule.type) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be of type ${rule.type}`
        });
        return;
      }

      // Number range checking
      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be greater than or equal to ${rule.min}`
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be less than or equal to ${rule.max}`
          });
        }
      }

      // Pattern matching
      if (rule.pattern && rule.type === 'string' && !rule.pattern.test(value)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} does not match required pattern`
        });
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} failed custom validation`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateBatch(type: string, dataArray: any[]): ValidationResult[] {
    return dataArray.map(data => this.validate(type, data));
  }

  validateStream(type: string, data: any): boolean {
    const result = this.validate(type, data);
    if (!result.isValid) {
      console.warn('Data validation failed:', result.errors);
    }
    return result.isValid;
  }

  async validateMarketData(symbol: string, timeframe: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get data from different sources
      const [binanceData, cachedData, dbData] = await Promise.all([
        BinanceService.getInstance().getMarketData(symbol, timeframe),
        CacheService.getInstance().getMarketData(symbol, timeframe),
        DatabaseService.getInstance().getTimeframeMetrics(symbol, timeframe)
      ]);

      // Validate price consistency
      if (binanceData && cachedData) {
        const priceDiff = Math.abs(binanceData.price - cachedData.price);
        const percentDiff = (priceDiff / binanceData.price) * 100;

        if (percentDiff > 1) {
          errors.push(`Price inconsistency detected: ${percentDiff.toFixed(2)}% difference between sources`);
        }
      }

      // Validate volume data
      if (binanceData?.volume === 0 && cachedData?.volume !== 0) {
        errors.push('Volume data mismatch: zero volume reported by Binance');
      }

      // Check for stale data
      const now = Date.now();
      const dataAge = now - (dbData?.timestamp || now);
      const maxAge = {
        '15m': 15 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000
      }[timeframe] || 60 * 60 * 1000;

      if (dataAge > maxAge) {
        warnings.push(`Data is stale: Last update was ${Math.floor(dataAge / 1000 / 60)} minutes ago`);
      }

      // Monitor performance
      this.performanceMonitor.trackMetric('dataValidation', {
        timeframe,
        symbol,
        responseTime: Date.now() - now,
        errors: errors.length,
        warnings: warnings.length
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Validation failed: ${error.message}`);
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }

  async validatePredictionAccuracy(symbol: string, timeframe: string): Promise<{
    accuracy: number;
    confidence: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const predictions = await DatabaseService.getInstance().getPredictionHistory(symbol, timeframe);
      if (!predictions || predictions.length === 0) {
        return { accuracy: 0, confidence: 0, errors: ['No prediction history available'] };
      }

      let correctPredictions = 0;
      let totalValidPredictions = 0;
      let confidenceSum = 0;

      for (const prediction of predictions) {
        if (!prediction.actualPerformance) continue;

        totalValidPredictions++;
        confidenceSum += prediction.confidence;

        const wasCorrect = 
          (prediction.direction === 'up' && prediction.actualPerformance > 0) ||
          (prediction.direction === 'down' && prediction.actualPerformance < 0);

        if (wasCorrect) correctPredictions++;
      }

      return {
        accuracy: totalValidPredictions > 0 ? (correctPredictions / totalValidPredictions) * 100 : 0,
        confidence: totalValidPredictions > 0 ? confidenceSum / totalValidPredictions : 0,
        errors
      };
    } catch (error) {
      errors.push(`Accuracy validation failed: ${error.message}`);
      return { accuracy: 0, confidence: 0, errors };
    }
  }

  async validateDataSync(): Promise<{
    isSynced: boolean;
    syncGaps: { timeframe: string; lastSync: number }[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const syncGaps: { timeframe: string; lastSync: number }[] = [];
    const timeframes = ['15m', '30m', '1h', '4h', '1d'];

    try {
      const syncStatus = await Promise.all(
        timeframes.map(async (timeframe) => {
          const lastSync = await DatabaseService.getInstance().getLastSyncTime(timeframe);
          const now = Date.now();
          const maxGap = {
            '15m': 15 * 60 * 1000,
            '30m': 30 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000
          }[timeframe];

          if (now - lastSync > maxGap) {
            syncGaps.push({ timeframe, lastSync });
          }

          return now - lastSync <= maxGap;
        })
      );

      return {
        isSynced: syncStatus.every(status => status),
        syncGaps,
        errors
      };
    } catch (error) {
      errors.push(`Sync validation failed: ${error.message}`);
      return {
        isSynced: false,
        syncGaps,
        errors
      };
    }
  }
}