import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { DataSyncService } from '../sync/DataSyncService';
import { BinanceService } from '../binance/BinanceService';
import { DatabaseService } from '../database/DatabaseService';
import { PredictionService } from '../prediction/PredictionService';
import { DataValidationService } from '../validation/DataValidationService';

interface TestConfig {
  duration: number; // milliseconds
  concurrentUsers: number;
  actionsPerSecond: number;
  rampUpTime: number; // milliseconds
}

interface TestResult {
  success?: boolean;
  metrics?: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    concurrentConnections: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  errors: string[];
  warnings: string[];
  timeframe?: string;
  predictionCount?: number;
  accuracyScore?: number;
  avgConfidence?: number;
  responseTime?: number;
}

interface LoadTestResult {
  concurrentUsers: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export class StressTestService {
  private static instance: StressTestService;
  private performanceMonitor: PerformanceMonitor;
  private dataSyncService: DataSyncService;
  private validationService: DataValidationService;
  private isRunning: boolean = false;
  private activeUsers: number = 0;
  private testResults: Map<string, TestResult> = new Map();

  private constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.dataSyncService = new DataSyncService();
    this.validationService = DataValidationService.getInstance();
  }

  public static getInstance(): StressTestService {
    if (!StressTestService.instance) {
      StressTestService.instance = new StressTestService();
    }
    return StressTestService.instance;
  }

  async runTest(config: TestConfig): Promise<TestResult> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.isRunning = true;
    this.performanceMonitor.start();
    const startTime = Date.now();
    const errors: string[] = [];
    const metrics: number[] = [];

    try {
      // Ramp up phase
      await this.rampUp(config);

      // Main test phase
      await this.runMainPhase(config);

      // Cool down phase
      await this.coolDown();

      const testDuration = Date.now() - startTime;
      const result = this.calculateTestResults(metrics, errors, testDuration);
      this.testResults.set(startTime.toString(), result);

      return result;
    } finally {
      this.isRunning = false;
      this.performanceMonitor.stop();
    }
  }

  private async rampUp(config: TestConfig): Promise<void> {
    const usersPerStep = Math.ceil(config.concurrentUsers / 10);
    const stepDuration = config.rampUpTime / 10;

    for (let i = 0; i < 10 && this.isRunning; i++) {
      const targetUsers = Math.min((i + 1) * usersPerStep, config.concurrentUsers);
      await this.adjustActiveUsers(targetUsers);
      await this.delay(stepDuration);
    }
  }

  private async runMainPhase(config: TestConfig): Promise<void> {
    const endTime = Date.now() + config.duration;
    const interval = 1000 / config.actionsPerSecond;

    while (Date.now() < endTime && this.isRunning) {
      await Promise.all([
        this.simulateUserActions(config),
        this.delay(interval)
      ]);
    }
  }

  private async coolDown(): Promise<void> {
    const coolDownSteps = 5;
    const stepDuration = 1000;

    for (let i = coolDownSteps - 1; i >= 0 && this.isRunning; i--) {
      const targetUsers = Math.floor((this.activeUsers * i) / coolDownSteps);
      await this.adjustActiveUsers(targetUsers);
      await this.delay(stepDuration);
    }
  }

  private async adjustActiveUsers(target: number): Promise<void> {
    while (this.activeUsers < target) {
      await this.addUser();
    }
    while (this.activeUsers > target) {
      await this.removeUser();
    }
  }

  private async addUser(): Promise<void> {
    this.activeUsers++;
    // Simulate user connection and initial data load
    await this.simulateUserConnection();
  }

  private async removeUser(): Promise<void> {
    this.activeUsers--;
    // Cleanup user connection
  }

  private async simulateUserActions(config: TestConfig): Promise<void> {
    const actions = [
      this.simulateDataFetch.bind(this),
      this.simulatePredict.bind(this),
      this.simulateChartUpdate.bind(this),
      this.simulateUIInteraction.bind(this)
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    await randomAction();
  }

  private async simulateUserConnection(): Promise<void> {
    try {
      // Simulate initial data load
      await this.dataSyncService.start();
    } catch (error) {
      console.error('Error simulating user connection:', error);
    }
  }

  private async simulateDataFetch(): Promise<void> {
    // Simulate API calls and data processing
    await this.delay(Math.random() * 100);
  }

  private async simulatePredict(): Promise<void> {
    // Simulate prediction calculations
    await this.delay(Math.random() * 200);
  }

  private async simulateChartUpdate(): Promise<void> {
    // Simulate chart rendering
    await this.delay(Math.random() * 50);
  }

  private async simulateUIInteraction(): Promise<void> {
    // Simulate user interactions
    await this.delay(Math.random() * 30);
  }

  private calculateTestResults(
    metrics: number[],
    errors: string[],
    duration: number
  ): TestResult {
    const perfReport = this.performanceMonitor.getPerformanceReport();

    return {
      success: errors.length === 0,
      metrics: {
        averageResponseTime: this.calculateAverageResponseTime(metrics),
        errorRate: errors.length / (metrics.length || 1),
        throughput: metrics.length / (duration / 1000),
        concurrentConnections: this.activeUsers,
        memoryUsage: perfReport.current.memory.usedJSHeapSize,
        cpuUsage: 100 - perfReport.current.fps / 60 * 100,
      },
      errors,
      warnings: perfReport.warnings,
    };
  }

  private calculateAverageResponseTime(metrics: number[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b) / metrics.length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTestResults(): Map<string, TestResult> {
    return new Map(this.testResults);
  }

  getLatestResult(): TestResult | null {
    if (this.testResults.size === 0) return null;
    const latest = Array.from(this.testResults.entries())
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))[0];
    return latest[1];
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }

  stopTest(): void {
    this.isRunning = false;
  }

  async runPredictionAccuracyTest(timeframe: string, duration: number = 24 * 60 * 60 * 1000): Promise<TestResult> {
    const startTime = Date.now();
    const endTime = startTime - duration;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get historical predictions
      const predictions = await DatabaseService.getInstance().getPredictionsInTimeRange(
        timeframe,
        endTime,
        startTime
      );

      if (!predictions || predictions.length === 0) {
        errors.push('No predictions found for the specified timeframe');
        return {
          timeframe,
          predictionCount: 0,
          accuracyScore: 0,
          avgConfidence: 0,
          responseTime: 0,
          errors,
          warnings
        };
      }

      let correctPredictions = 0;
      let totalConfidence = 0;
      let validPredictions = 0;

      for (const prediction of predictions) {
        if (!prediction.actualPerformance) continue;

        validPredictions++;
        totalConfidence += prediction.confidence;

        const wasCorrect = 
          (prediction.direction === 'up' && prediction.actualPerformance > 0) ||
          (prediction.direction === 'down' && prediction.actualPerformance < 0);

        if (wasCorrect) correctPredictions++;
      }

      const accuracyScore = validPredictions > 0 
        ? (correctPredictions / validPredictions) * 100 
        : 0;

      const avgConfidence = validPredictions > 0 
        ? totalConfidence / validPredictions 
        : 0;

      if (accuracyScore < 70) {
        warnings.push(`Accuracy below target: ${accuracyScore.toFixed(2)}% (target: 70%)`);
      }

      if (avgConfidence < 60) {
        warnings.push(`Average confidence below threshold: ${avgConfidence.toFixed(2)}% (threshold: 60%)`);
      }

      return {
        timeframe,
        predictionCount: validPredictions,
        accuracyScore,
        avgConfidence,
        responseTime: Date.now() - startTime,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Test failed: ${error.message}`);
      return {
        timeframe,
        predictionCount: 0,
        accuracyScore: 0,
        avgConfidence: 0,
        responseTime: Date.now() - startTime,
        errors,
        warnings
      };
    }
  }

  async runLoadTest(concurrentUsers: number, duration: number = 300000): Promise<LoadTestResult> {
    const startTime = Date.now();
    const requests: Promise<void>[] = [];
    let errorCount = 0;
    let totalResponseTime = 0;
    let requestCount = 0;

    // Monitor initial resource usage
    const initialMemory = process.memoryUsage().heapUsed;
    const initialCPU = process.cpuUsage();

    // Simulate concurrent users
    for (let i = 0; i < concurrentUsers; i++) {
      requests.push(
        (async () => {
          const userStartTime = Date.now();
          
          while (Date.now() - startTime < duration) {
            try {
              const requestStartTime = Date.now();
              
              // Simulate typical user actions
              await Promise.all([
                BinanceService.getMarketData('BTCUSDT'),
                PredictionService.getInstance().getPrediction('BTCUSDT', '1h'),
                this.validationService.validateMarketData('BTCUSDT', '1h')
              ]);

              totalResponseTime += Date.now() - requestStartTime;
              requestCount++;

              // Add random delay between requests (100-500ms)
              await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
            } catch (error) {
              errorCount++;
              console.error(`Load test error: ${error.message}`);
            }
          }
        })()
      );
    }

    // Wait for all simulated users to complete
    await Promise.all(requests);

    // Calculate final resource usage
    const finalMemory = process.memoryUsage().heapUsed;
    const finalCPU = process.cpuUsage(initialCPU);

    const memoryUsage = finalMemory - initialMemory;
    const cpuUsage = (finalCPU.user + finalCPU.system) / 1000000; // Convert to milliseconds

    return {
      concurrentUsers,
      avgResponseTime: requestCount > 0 ? totalResponseTime / requestCount : 0,
      errorRate: (errorCount / requestCount) * 100,
      memoryUsage,
      cpuUsage
    };
  }

  async runFullTestSuite(): Promise<{
    accuracyTests: TestResult[];
    loadTests: LoadTestResult[];
    duration: number;
  }> {
    const startTime = Date.now();
    const timeframes = ['15m', '30m', '1h', '4h', '1d'];
    const concurrentUsers = [10, 50, 100];

    // Run accuracy tests for all timeframes
    const accuracyTests = await Promise.all(
      timeframes.map(timeframe => this.runPredictionAccuracyTest(timeframe))
    );

    // Run load tests with different concurrent user counts
    const loadTests = await Promise.all(
      concurrentUsers.map(users => this.runLoadTest(users))
    );

    return {
      accuracyTests,
      loadTests,
      duration: Date.now() - startTime
    };
  }
}