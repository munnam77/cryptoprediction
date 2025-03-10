import configureTensorFlow from '../config/tensorflow.config';
import { adaptiveLearning } from './adaptiveLearning';
import LoggingService from './LoggingService';

/**
 * Initialize all services required by the application
 * This ensures proper configuration before any components try to use them
 */
export const initializeServices = async () => {
  try {
    LoggingService.info('Initializing services...');
    
    // Initialize TensorFlow.js with our custom configuration
    const tf = await configureTensorFlow();
    LoggingService.info(`TensorFlow.js initialized with backend: ${tf.getBackend()}`);
    
    // Initialize adaptive learning system
    await adaptiveLearning.initialize();
    LoggingService.info('Adaptive learning system initialized');
    
    // Add more service initializations here as needed
    
    LoggingService.info('All services initialized successfully');
    return true;
  } catch (error) {
    LoggingService.error('Failed to initialize services', error);
    return false;
  }
};

export default initializeServices; 