export interface TimeframeData {
  '15m': number;
  '30m': number;
  '1h': number;
  '4h': number;
  '1d': number;
}

export interface ModelPrediction {
  symbol: string;
  predictedChange: number;
  confidence: number;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  timestamp: string;
  actualChange?: number;
  features?: {
    [key: string]: number;
  };
}

export interface SentimentAnalysisResult {
  symbol: string;
  timeframe: string;
  sentimentScore: number; // 0-100, where 100 is most positive
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalMentions: number;
  volumeChange: number; // Percentage change in volume correlated with sentiment
  topKeywords: string[];
  lastUpdated: string; // ISO timestamp
}

export interface ModelParameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
  layers: number[];
  dropout: number;
}

export interface TrainingResult {
  accuracy: number;
  loss: number;
  duration: number; // in milliseconds
  timestamp: string;
  parameters: ModelParameters;
}

export interface PredictionAccuracy {
  symbol: string;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  accuracy: number; // percentage
  sampleSize: number;
  period: string; // e.g., 'last 24h', 'last 7d'
  timestamp: string;
}
