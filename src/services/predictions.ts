import { LinearRegression } from 'ml-regression';
import { TechnicalIndicators, analyzeTechnicals } from './technicalAnalysis';

interface PredictionInput {
  prices: number[];
  volume: number[];
  technicals: TechnicalIndicators;
}

interface PredictionResult {
  direction: 'up' | 'down';
  confidence: number;
  targetPrice: number;
  timeframe: string;
}

function prepareFeatures(input: PredictionInput): number[][] {
  const {
    prices,
    volume,
    technicals: { rsi, macd, bollingerBands, adx, atr, roc }
  } = input;

  // Create feature matrix
  return prices.map((price, i) => [
    price,
    volume[i],
    rsi,
    macd.macdLine,
    macd.histogram,
    bollingerBands.upper - bollingerBands.lower,
    adx,
    atr,
    roc
  ]);
}

function calculateConfidence(
  prediction: number,
  actual: number,
  volatility: number
): number {
  const error = Math.abs((prediction - actual) / actual);
  const baseConfidence = 100 * (1 - error);
  const volatilityAdjustment = volatility * 10;
  return Math.min(Math.max(baseConfidence - volatilityAdjustment, 0), 100);
}

export async function generatePrediction(
  symbol: string,
  timeframe: string,
  historicalData: { prices: number[]; volume: number[] }
): Promise<PredictionResult> {
  const technicals = analyzeTechnicals(historicalData.prices);
  const input: PredictionInput = {
    prices: historicalData.prices,
    volume: historicalData.volume,
    technicals
  };

  const features = prepareFeatures(input);
  const labels = historicalData.prices.slice(1).concat([0]);

  // Train linear regression model
  const regression = new LinearRegression(features, labels);
  const latestFeatures = features[features.length - 1];
  const prediction = regression.predict(latestFeatures);

  const currentPrice = historicalData.prices[historicalData.prices.length - 1];
  const direction = prediction > currentPrice ? 'up' : 'down';
  
  const volatility = Math.abs(technicals.atr / currentPrice);
  const confidence = calculateConfidence(prediction, currentPrice, volatility);

  return {
    direction,
    confidence,
    targetPrice: prediction,
    timeframe
  };
}