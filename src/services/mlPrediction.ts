import { LinearRegression } from 'ml-regression';
import { analyzeTechnicals, TechnicalIndicators } from './technicalAnalysis';

interface TrainingData {
  features: number[][];
  labels: number[];
}

interface PredictionResult {
  price: number;
  direction: 'up' | 'down';
  confidence: number;
  timestamp: number;
}

class MLPredictor {
  private model: LinearRegression | null = null;
  private lastTrainingTime: number = 0;
  private readonly TRAINING_INTERVAL = 1000 * 60 * 60; // 1 hour

  private prepareFeatures(
    prices: number[],
    volumes: number[],
    technicals: TechnicalIndicators
  ): number[] {
    const priceChange = (prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2];
    const volumeChange = (volumes[volumes.length - 1] - volumes[volumes.length - 2]) / volumes[volumes.length - 2];
    
    return [
      priceChange,
      volumeChange,
      technicals.rsi,
      technicals.macd.macdLine,
      technicals.macd.histogram,
      technicals.adx,
      technicals.atr,
      technicals.roc
    ];
  }

  private prepareTrainingData(
    historicalPrices: number[],
    historicalVolumes: number[],
    window: number = 14
  ): TrainingData {
    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = window; i < historicalPrices.length - 1; i++) {
      const prices = historicalPrices.slice(i - window, i);
      const volumes = historicalVolumes.slice(i - window, i);
      const technicals = analyzeTechnicals(prices);
      
      features.push(this.prepareFeatures(prices, volumes, technicals));
      labels.push(historicalPrices[i + 1]);
    }

    return { features, labels };
  }

  private calculateConfidence(
    prediction: number,
    actual: number,
    volatility: number
  ): number {
    const error = Math.abs((prediction - actual) / actual);
    const baseConfidence = 100 * (1 - error);
    const volatilityAdjustment = volatility * 10;
    return Math.min(Math.max(baseConfidence - volatilityAdjustment, 0), 100);
  }

  async train(
    historicalPrices: number[],
    historicalVolumes: number[]
  ): Promise<void> {
    const now = Date.now();
    if (now - this.lastTrainingTime < this.TRAINING_INTERVAL) {
      return;
    }

    const { features, labels } = this.prepareTrainingData(
      historicalPrices,
      historicalVolumes
    );

    this.model = new LinearRegression(features, labels);
    this.lastTrainingTime = now;
  }

  async predict(
    prices: number[],
    volumes: number[]
  ): Promise<PredictionResult> {
    if (!this.model) {
      throw new Error('Model not trained');
    }

    const technicals = analyzeTechnicals(prices);
    const features = this.prepareFeatures(prices, volumes, technicals);
    const prediction = this.model.predict(features);
    const currentPrice = prices[prices.length - 1];
    
    const volatility = technicals.atr / currentPrice;
    const confidence = this.calculateConfidence(prediction, currentPrice, volatility);

    return {
      price: prediction,
      direction: prediction > currentPrice ? 'up' : 'down',
      confidence,
      timestamp: Date.now()
    };
  }

  getAccuracy(): number {
    // Implementation for accuracy calculation
    return 75; // Placeholder
  }
}

export const mlPredictor = new MLPredictor();