/**
 * LoggingService
 * 
 * Provides centralized logging and error handling for the application
 * Supports different log levels and can be configured to send logs to a server in production
 */
class LoggingService {
  // Log levels
  public static readonly LOG_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
  };
  
  // Current log level (can be set based on environment)
  private static logLevel = import.meta.env.MODE === 'production' 
    ? LoggingService.LOG_LEVEL.INFO 
    : LoggingService.LOG_LEVEL.DEBUG;
  
  // Maximum number of logs to keep in memory
  private static readonly MAX_LOGS = 1000;
  
  // Log storage
  private static logs: Array<{
    timestamp: number;
    level: number;
    message: string;
    data?: any;
  }> = [];
  
  // Error handlers
  private static errorHandlers: Array<(error: Error) => void> = [];
  
  /**
   * Set the current log level
   * @param level The log level to set
   */
  public static setLogLevel(level: number): void {
    LoggingService.logLevel = level;
  }
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param data Optional data to include
   */
  public static debug(message: string, data?: any): void {
    if (LoggingService.logLevel <= LoggingService.LOG_LEVEL.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
      LoggingService.addLog(LoggingService.LOG_LEVEL.DEBUG, message, data);
    }
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional data to include
   */
  public static info(message: string, data?: any): void {
    if (LoggingService.logLevel <= LoggingService.LOG_LEVEL.INFO) {
      console.info(`[INFO] ${message}`, data);
      LoggingService.addLog(LoggingService.LOG_LEVEL.INFO, message, data);
    }
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional data to include
   */
  public static warn(message: string, data?: any): void {
    if (LoggingService.logLevel <= LoggingService.LOG_LEVEL.WARN) {
      console.warn(`[WARN] ${message}`, data);
      LoggingService.addLog(LoggingService.LOG_LEVEL.WARN, message, data);
    }
  }
  
  /**
   * Log an error message
   * @param message The message to log
   * @param error The error object
   */
  public static error(message: string, error?: any): void {
    if (LoggingService.logLevel <= LoggingService.LOG_LEVEL.ERROR) {
      console.error(`[ERROR] ${message}`, error);
      LoggingService.addLog(LoggingService.LOG_LEVEL.ERROR, message, error);
      
      // Notify error handlers
      if (error instanceof Error) {
        LoggingService.notifyErrorHandlers(error);
      } else if (error && typeof error === 'object') {
        LoggingService.notifyErrorHandlers(new Error(message));
      }
    }
  }
  
  /**
   * Add a log entry to the log storage
   * @param level The log level
   * @param message The message to log
   * @param data Optional data to include
   */
  private static addLog(level: number, message: string, data?: any): void {
    LoggingService.logs.push({
      timestamp: Date.now(),
      level,
      message,
      data
    });
    
    // Trim logs if they exceed the maximum
    if (LoggingService.logs.length > LoggingService.MAX_LOGS) {
      LoggingService.logs = LoggingService.logs.slice(-LoggingService.MAX_LOGS);
    }
  }
  
  /**
   * Get all logs
   * @returns The logs
   */
  public static getLogs(): Array<{
    timestamp: number;
    level: number;
    message: string;
    data?: any;
  }> {
    return [...LoggingService.logs];
  }
  
  /**
   * Clear all logs
   */
  public static clearLogs(): void {
    LoggingService.logs = [];
  }
  
  /**
   * Register a global error handler
   * @param handler The error handler function
   * @returns A function to unregister the handler
   */
  public static registerErrorHandler(handler: (error: Error) => void): () => void {
    LoggingService.errorHandlers.push(handler);
    
    // Return a function to unregister the handler
    return () => {
      LoggingService.errorHandlers = LoggingService.errorHandlers.filter(h => h !== handler);
    };
  }
  
  /**
   * Notify all error handlers of an error
   * @param error The error to notify about
   */
  private static notifyErrorHandlers(error: Error): void {
    LoggingService.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });
  }
  
  /**
   * Initialize global error handling
   */
  public static initGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      LoggingService.error('Unhandled promise rejection', event.reason);
    });
    
    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      LoggingService.error('Uncaught exception', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
    
    // Log when the application is about to unload
    window.addEventListener('beforeunload', () => {
      LoggingService.info('Application unloading');
    });
    
    LoggingService.info('Global error handling initialized');
  }
}

export default LoggingService; 