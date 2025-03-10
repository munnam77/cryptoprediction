import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LoggingService from './services/LoggingService';
import ENV_CONFIG from './config/environment';

// Initialize global error handling
LoggingService.initGlobalErrorHandling();

// Log application startup
LoggingService.info(`Starting ${ENV_CONFIG.APP_CONFIG.APP_NAME} v${ENV_CONFIG.APP_CONFIG.APP_VERSION}`);
LoggingService.info(`Environment: ${process.env.NODE_ENV}`);

// Lazy load the App component
const App = lazy(() => import('./App'));

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <h1 className="mt-4 text-xl font-bold text-white">Loading CryptoPrediction</h1>
      <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse-slow"></div>
      </div>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    LoggingService.error('Uncaught error in component tree', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="bg-crypto-dark rounded-xl shadow-crypto-lg p-8 max-w-md">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="ml-3 text-xl font-bold text-white">Something went wrong</h2>
            </div>
            <p className="text-gray-400 mb-6">
              We're sorry, but something went wrong. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button 
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
