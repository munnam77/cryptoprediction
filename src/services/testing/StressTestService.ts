import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { DataSyncService } from '../sync/DataSyncService';

interface TestConfig {
  duration: number; // milliseconds
  concurrentUsers: number;
  actionsPerSecond: number;
  rampUpTime: number; // milliseconds
}

interface TestResult {
  success: boolean;
  metrics: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    concurrentConnections: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  errors: string[];
  warnings: string[];
}

export class StressTestService {
  private performanceMonitor: PerformanceMonitor;
  private dataSyncService: DataSyncService;
  private isRunning: boolean = false;
  private activeUsers: number = 0;
  private testResults: Map<string, TestResult> = new Map();

  constructor(
    performanceMonitor: PerformanceMonitor,
    dataSyncService: DataSyncService
  ) {
    this.performanceMonitor = performanceMonitor;
    this.dataSyncService = dataSyncService;
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
}