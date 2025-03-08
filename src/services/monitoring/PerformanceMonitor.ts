interface PerformanceMetrics {
    fps: number;
    memory: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    timing: {
      [key: string]: number;
    };
    errors: {
      count: number;
      lastError: string | null;
    };
  }
  
  interface MetricSnapshot {
    timestamp: number;
    metrics: PerformanceMetrics;
  }
  
  export class PerformanceMonitor {
    private metrics: PerformanceMetrics;
    private history: MetricSnapshot[] = [];
    private maxHistoryLength: number = 100;
    private fpsHistory: number[] = [];
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private isMonitoring: boolean = false;
    private animationFrameId: number | null = null;
    private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  
    constructor() {
      this.metrics = {
        fps: 0,
        memory: {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
        },
        timing: {},
        errors: {
          count: 0,
          lastError: null,
        },
      };
  
      this.setupErrorHandling();
    }
  
    start(): void {
      if (this.isMonitoring) return;
      this.isMonitoring = true;
      this.monitorFrameRate();
      this.monitorMemory();
      this.monitorNetworkRequests();
    }
  
    stop(): void {
      this.isMonitoring = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  
    private monitorFrameRate(): void {
      const updateFPS = (timestamp: number) => {
        if (!this.isMonitoring) return;
  
        if (this.lastFrameTime) {
          const delta = timestamp - this.lastFrameTime;
          const currentFPS = 1000 / delta;
          this.fpsHistory.push(currentFPS);
  
          if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
          }
  
          this.metrics.fps = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
        }
  
        this.lastFrameTime = timestamp;
        this.frameCount++;
  
        if (this.frameCount % 60 === 0) {
          this.saveMetricSnapshot();
          this.notifyListeners();
        }
  
        this.animationFrameId = requestAnimationFrame(updateFPS);
      };
  
      this.animationFrameId = requestAnimationFrame(updateFPS);
    }
  
    private monitorMemory(): void {
      const updateMemory = () => {
        if (!this.isMonitoring) return;
  
        if (window.performance && (performance as any).memory) {
          const memory = (performance as any).memory;
          this.metrics.memory = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          };
        }
  
        setTimeout(updateMemory, 1000);
      };
  
      updateMemory();
    }
  
    private monitorNetworkRequests(): void {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();
          this.recordTiming('fetch', endTime - startTime);
          return response;
        } catch (error) {
          this.recordError(error);
          throw error;
        }
      };
    }
  
    private setupErrorHandling(): void {
      window.onerror = (message, source, lineno, colno, error) => {
        this.recordError(error || message);
      };
  
      window.onunhandledrejection = (event) => {
        this.recordError(event.reason);
      };
    }
  
    recordTiming(key: string, duration: number): void {
      this.metrics.timing[key] = (this.metrics.timing[key] || 0) + duration;
    }
  
    private recordError(error: any): void {
      this.metrics.errors.count++;
      this.metrics.errors.lastError = error?.message || String(error);
      this.notifyListeners();
    }
  
    private saveMetricSnapshot(): void {
      this.history.push({
        timestamp: Date.now(),
        metrics: { ...this.metrics },
      });
  
      if (this.history.length > this.maxHistoryLength) {
        this.history.shift();
      }
    }
  
    getMetrics(): PerformanceMetrics {
      return { ...this.metrics };
    }
  
    getHistory(): MetricSnapshot[] {
      return [...this.history];
    }
  
    subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
  
    private notifyListeners(): void {
      const currentMetrics = this.getMetrics();
      this.listeners.forEach(listener => listener(currentMetrics));
    }
  
    getPerformanceReport(): {
      current: PerformanceMetrics;
      averages: PerformanceMetrics;
      warnings: string[];
    } {
      const averages = this.calculateAverages();
      const warnings = this.generateWarnings(averages);
  
      return {
        current: this.getMetrics(),
        averages,
        warnings,
      };
    }
  
    private calculateAverages(): PerformanceMetrics {
      const avgMetrics: PerformanceMetrics = {
        fps: 0,
        memory: {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
        },
        timing: {},
        errors: {
          count: this.metrics.errors.count,
          lastError: this.metrics.errors.lastError,
        },
      };
  
      if (this.history.length === 0) return avgMetrics;
  
      // Calculate averages
      this.history.forEach(snapshot => {
        avgMetrics.fps += snapshot.metrics.fps;
        avgMetrics.memory.usedJSHeapSize += snapshot.metrics.memory.usedJSHeapSize;
        avgMetrics.memory.totalJSHeapSize += snapshot.metrics.memory.totalJSHeapSize;
  
        Object.entries(snapshot.metrics.timing).forEach(([key, value]) => {
          avgMetrics.timing[key] = (avgMetrics.timing[key] || 0) + value;
        });
      });
  
      // Normalize averages
      avgMetrics.fps /= this.history.length;
      avgMetrics.memory.usedJSHeapSize /= this.history.length;
      avgMetrics.memory.totalJSHeapSize /= this.history.length;
  
      Object.keys(avgMetrics.timing).forEach(key => {
        avgMetrics.timing[key] /= this.history.length;
      });
  
      return avgMetrics;
    }
  
    private generateWarnings(averages: PerformanceMetrics): string[] {
      const warnings: string[] = [];
  
      if (averages.fps < 30) {
        warnings.push('Low frame rate detected (< 30 FPS)');
      }
  
      if (averages.memory.usedJSHeapSize / averages.memory.totalJSHeapSize > 0.9) {
        warnings.push('High memory usage (> 90%)');
      }
  
      Object.entries(averages.timing).forEach(([key, value]) => {
        if (value > 1000) {
          warnings.push(`Slow ${key} operations (> 1000ms average)`);
        }
      });
  
      if (this.metrics.errors.count > 0) {
        warnings.push(`${this.metrics.errors.count} errors detected`);
      }
  
      return warnings;
    }
  }