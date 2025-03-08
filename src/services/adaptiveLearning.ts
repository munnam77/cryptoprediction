import * as tf from '@tensorflow/tfjs';
import { predictionModel } from './predictionModel';

interface AdaptiveConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  validationSplit: number;
}

class AdaptiveLearningSystem {
  private config: AdaptiveConfig = {
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    validationSplit: 0.2
  };

  private historicalErrors: number[] = [];
  private weightAdjustments: number = 0;

  async adjustModelWeights(
    actualPrice: number,
    predictedPrice: number,
    features: tf.Tensor
  ): Promise<void> {
    const error = Math.abs(actualPrice - predictedPrice) / actualPrice;
    this.historicalErrors.push(error);

    // Calculate new learning rate based on recent performance
    const recentErrors = this.historicalErrors.slice(-10);
    const averageError = recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length;
    
    if (averageError > 0.1) { // If error is high, increase learning rate
      this.config.learningRate *= 1.1;
    } else {
      this.config.learningRate *= 0.9;
    }

    // Create target tensor
    const target = tf.tensor2d([[actualPrice]]);

    // Retrain model with new weights
    await predictionModel.retrainModel(features, target, {
      learningRate: this.config.learningRate,
      epochs: this.config.epochs,
      batchSize: this.config.batchSize,
      validationSplit: this.config.validationSplit
    });

    this.weightAdjustments++;
  }

  getPerformanceMetrics() {
    return {
      averageError: this.historicalErrors.reduce((a, b) => a + b, 0) / this.historicalErrors.length,
      weightAdjustments: this.weightAdjustments,
      currentLearningRate: this.config.learningRate
    };
  }

  resetMetrics() {
    this.historicalErrors = [];
    this.weightAdjustments = 0;
    this.config.learningRate = 0.001;
  }
}

export const adaptiveLearning = new AdaptiveLearningSystem();