import * as tf from '@tensorflow/tfjs';
import { Brain } from 'brain.js';
import { analyzeTechnicals } from './technicalAnalysis';
import dayjs from 'dayjs';

interface PredictionResult {
  price: number;
  direction: 'up' | 'down';
  confidence: number;
  timestamp: number;
}

interface ModelMetrics {
  mape: number;
  rmse: number;
  accuracy: number;
}

interface TrainingConfig {
  learningRate: number;
  epochs: number;
  batchSize: number;
  validationSplit: number;
}

class PredictionModel {
  private lstmModel: tf.LayersModel | null = null;
  private brainNetwork: Brain | null = null;
  private metrics: ModelMetrics = {
    mape: 0,
    rmse: 0,
    accuracy: 0
  };

  async initialize() {
    // Initialize LSTM model
    this.lstmModel = tf.sequential();
    this.lstmModel.add(tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [30, 8] // 30 timesteps, 8 features
    }));
    this.lstmModel.add(tf.layers.lstm({ units: 30, returnSequences: false }));
    this.lstmModel.add(tf.layers.dense({ units: 1 }));

    this.lstmModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    // Initialize Brain.js network
    this.brainNetwork = new Brain({
      hiddenLayers: [20, 20],
      activation: 'sigmoid'
    });
  }

  private calculateConfidenceScore(mape: number): number {
    return Math.max(0, Math.min(100, 100 - (mape * 100)));
  }

  private calculateMAPE(actual: number[], predicted: number[]): number {
    const mape = actual.reduce((sum, val, i) => {
      return sum + Math.abs((val - predicted[i]) / val);
    }, 0) / actual.length;
    return mape;
  }

  private calculateRMSE(actual: number[], predicted: number[]): number {
    const mse = actual.reduce((sum, val, i) => {
      return sum + Math.pow(val - predicted[i], 2);
    }, 0) / actual.length;
    return Math.sqrt(mse);
  }

  private async preprocessData(prices: number[], volumes: number[]): Promise<tf.Tensor> {
    const technicals = analyzeTechnicals(prices);
    const features = [
      prices,
      volumes,
      Array(prices.length).fill(technicals.rsi),
      Array(prices.length).fill(technicals.macd.histogram),
      Array(prices.length).fill(technicals.bollingerBands.upper),
      Array(prices.length).fill(technicals.bollingerBands.lower),
      Array(prices.length).fill(technicals.adx),
      Array(prices.length).fill(technicals.atr)
    ];

    return tf.tensor3d([features], [1, features.length, features[0].length]);
  }

  async train(historicalData: { prices: number[]; volumes: number[] }) {
    const { prices, volumes } = historicalData;
    const inputTensor = await this.preprocessData(prices, volumes);
    const outputTensor = tf.tensor2d([prices.slice(1)], [1, prices.length - 1]);

    await this.lstmModel?.fit(inputTensor, outputTensor, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });

    // Update metrics
    const predictions = await this.lstmModel?.predict(inputTensor) as tf.Tensor;
    const predictedValues = await predictions.array() as number[][];
    const actualValues = prices.slice(1);
    
    this.metrics.mape = this.calculateMAPE(actualValues, predictedValues[0]);
    this.metrics.rmse = this.calculateRMSE(actualValues, predictedValues[0]);
    this.metrics.accuracy = this.calculateConfidenceScore(this.metrics.mape);
  }

  async retrainModel(features: tf.Tensor, target: tf.Tensor, config: TrainingConfig) {
    if (!this.lstmModel) return;

    // Recompile model with new learning rate
    this.lstmModel.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'meanSquaredError'
    });

    // Retrain with new data
    await this.lstmModel.fit(features, target, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationSplit: config.validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Retraining Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });
  }

  async predict(prices: number[], volumes: number[]): Promise<PredictionResult> {
    const inputTensor = await this.preprocessData(prices, volumes);
    const prediction = await this.lstmModel?.predict(inputTensor) as tf.Tensor;
    const predictedValue = (await prediction.array() as number[][])[0][0];
    const currentPrice = prices[prices.length - 1];

    const confidence = this.calculateConfidenceScore(this.metrics.mape);

    return {
      price: predictedValue,
      direction: predictedValue > currentPrice ? 'up' : 'down',
      confidence,
      timestamp: Date.now()
    };
  }

  getMetrics(): ModelMetrics {
    return this.metrics;
  }
}

export const predictionModel = new PredictionModel();
predictionModel.initialize();