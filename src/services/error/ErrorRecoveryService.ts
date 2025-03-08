interface ErrorConfig {
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
    maxBackoffDelay: number;
  }
  
  interface ErrorLog {
    timestamp: number;
    error: Error;
    context: string;
    attempts: number;
    resolved: boolean;
  }
  
  export class ErrorRecoveryService {
    private config: ErrorConfig;
    private errorLogs: ErrorLog[] = [];
    private activeRecoveries: Map<string, Promise<void>> = new Map();
    private recoveryStrategies: Map<string, (error: Error) => Promise<void>> = new Map();
  
    constructor(config: Partial<ErrorConfig> = {}) {
      this.config = {
        maxRetries: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
        maxBackoffDelay: 30000,
        ...config
      };
  
      this.setupDefaultStrategies();
    }
  
    private setupDefaultStrategies(): void {
      // Network error recovery
      this.addRecoveryStrategy('NetworkError', async (error) => {
        await this.retryWithBackoff(async () => {
          // Attempt to re-establish connection
          await this.checkConnectivity();
        });
      });
  
      // API error recovery
      this.addRecoveryStrategy('APIError', async (error) => {
        if (error.message.includes('rate limit')) {
          await this.handleRateLimitError();
        } else {
          await this.retryWithBackoff(async () => {
            // Attempt to refresh API session
            await this.refreshAPISession();
          });
        }
      });
  
      // Data sync error recovery
      this.addRecoveryStrategy('SyncError', async (error) => {
        await this.retryWithBackoff(async () => {
          // Attempt to resync data
          await this.resyncData();
        });
      });
    }
  
    addRecoveryStrategy(errorType: string, strategy: (error: Error) => Promise<void>): void {
      this.recoveryStrategies.set(errorType, strategy);
    }
  
    async handleError(error: Error, context: string): Promise<void> {
      const errorLog: ErrorLog = {
        timestamp: Date.now(),
        error,
        context,
        attempts: 0,
        resolved: false
      };
      this.errorLogs.push(errorLog);
  
      // Check if recovery is already in progress for this context
      if (this.activeRecoveries.has(context)) {
        return this.activeRecoveries.get(context);
      }
  
      const recoveryPromise = this.attemptRecovery(error, context, errorLog);
      this.activeRecoveries.set(context, recoveryPromise);
  
      try {
        await recoveryPromise;
        errorLog.resolved = true;
      } finally {
        this.activeRecoveries.delete(context);
      }
    }
  
    private async attemptRecovery(error: Error, context: string, log: ErrorLog): Promise<void> {
      const errorType = this.determineErrorType(error);
      const strategy = this.recoveryStrategies.get(errorType);
  
      if (!strategy) {
        throw new Error(`No recovery strategy found for error type: ${errorType}`);
      }
  
      while (log.attempts < this.config.maxRetries) {
        try {
          await strategy(error);
          return; // Recovery successful
        } catch (recoveryError) {
          log.attempts++;
          if (log.attempts >= this.config.maxRetries) {
            throw new Error(`Recovery failed after ${log.attempts} attempts: ${recoveryError.message}`);
          }
          await this.delay(this.calculateBackoff(log.attempts));
        }
      }
    }
  
    private determineErrorType(error: Error): string {
      if (error instanceof TypeError && error.message.includes('network')) {
        return 'NetworkError';
      }
      if (error.message.includes('API')) {
        return 'APIError';
      }
      if (error.message.includes('sync')) {
        return 'SyncError';
      }
      return 'UnknownError';
    }
  
    private calculateBackoff(attempt: number): number {
      if (!this.config.exponentialBackoff) {
        return this.config.retryDelay;
      }
  
      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      return Math.min(delay, this.config.maxBackoffDelay);
    }
  
    private async retryWithBackoff(operation: () => Promise<void>): Promise<void> {
      let attempt = 0;
      while (attempt < this.config.maxRetries) {
        try {
          await operation();
          return;
        } catch (error) {
          attempt++;
          if (attempt >= this.config.maxRetries) {
            throw error;
          }
          await this.delay(this.calculateBackoff(attempt));
        }
      }
    }
  
    private async checkConnectivity(): Promise<void> {
      try {
        await fetch('https://api.binance.com/api/v3/ping');
      } catch (error) {
        throw new Error('Network connectivity check failed');
      }
    }
  
    private async refreshAPISession(): Promise<void> {
      // Implement API session refresh logic
      await this.delay(1000);
    }
  
    private async resyncData(): Promise<void> {
      // Implement data resync logic
      await this.delay(1000);
    }
  
    private async handleRateLimitError(): Promise<void> {
      // Wait for rate limit to reset
      await this.delay(60000);
    }
  
    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    getErrorLogs(): ErrorLog[] {
      return [...this.errorLogs];
    }
  
    getActiveRecoveries(): string[] {
      return Array.from(this.activeRecoveries.keys());
    }
  
    clearErrorLogs(): void {
      this.errorLogs = [];
    }
  }