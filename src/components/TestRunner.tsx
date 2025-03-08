import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Clock, BarChart3 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

// Define test types and result interfaces
type TestStatus = 'idle' | 'running' | 'success' | 'failed' | 'warning';
type TestType = 'prediction' | 'dataIntegrity' | 'performance' | 'api' | 'sentiment';

interface TestResult {
  id: string;
  name: string;
  type: TestType;
  status: TestStatus;
  duration?: number; // in milliseconds
  message?: string;
  details?: string;
  timestamp: number;
}

interface TestRunnerProps {
  className?: string;
}

const TestRunner = ({ className = '' }: TestRunnerProps) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTestTypes, setSelectedTestTypes] = useState<TestType[]>(['prediction', 'dataIntegrity', 'performance']);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<number | null>(null);

  // Available tests configuration
  const availableTests = [
    { 
      id: 'predict-accuracy', 
      name: 'Prediction Accuracy', 
      type: 'prediction',
      run: async (): Promise<Partial<TestResult>> => {
        // Simulate testing prediction accuracy
        await new Promise(resolve => setTimeout(resolve, 1500));
        const accuracy = Math.random() * 100;
        return {
          status: accuracy > 75 ? 'success' : accuracy > 60 ? 'warning' : 'failed',
          duration: 1500,
          message: `Accuracy: ${accuracy.toFixed(2)}%`,
          details: `Tested 50 historical predictions across all timeframes. ${
            accuracy > 75 ? 'Strong performance.' : accuracy > 60 ? 'Needs improvement.' : 'Poor performance.'
          }`
        };
      }
    },
    { 
      id: 'data-consistency', 
      name: 'Data Integrity Check', 
      type: 'dataIntegrity',
      run: async (): Promise<Partial<TestResult>> => {
        // Simulate testing data integrity
        await new Promise(resolve => setTimeout(resolve, 800));
        const integrityScore = Math.random() * 100;
        const foundIssues = integrityScore < 95;
        return {
          status: foundIssues ? 'warning' : 'success',
          duration: 800,
          message: `Integrity Score: ${integrityScore.toFixed(2)}%`,
          details: foundIssues ? 
            'Issues found: Some market data records have missing volume data. 5 duplicate symbol entries detected.' : 
            'All data integrity checks passed successfully.'
        };
      }
    },
    { 
      id: 'performance-test', 
      name: 'Performance Benchmark', 
      type: 'performance',
      run: async (): Promise<Partial<TestResult>> => {
        // Simulate testing performance
        await new Promise(resolve => setTimeout(resolve, 2000));
        const avgResponseTime = 120 + Math.random() * 380;
        return {
          status: avgResponseTime < 200 ? 'success' : avgResponseTime < 400 ? 'warning' : 'failed',
          duration: 2000,
          message: `Avg Response: ${avgResponseTime.toFixed(2)}ms`,
          details: `Tested API endpoints under load (500 concurrent requests). ${
            avgResponseTime < 200 ? 'Performance is excellent.' : 
            avgResponseTime < 400 ? 'Performance is acceptable but could be improved.' : 
            'Performance is below acceptable threshold.'
          }`
        };
      }
    },
    { 
      id: 'api-status', 
      name: 'External API Status', 
      type: 'api',
      run: async (): Promise<Partial<TestResult>> => {
        // Simulate checking external APIs
        await new Promise(resolve => setTimeout(resolve, 1200));
        const allApisAvailable = Math.random() > 0.1;
        return {
          status: allApisAvailable ? 'success' : 'warning',
          duration: 1200,
          message: allApisAvailable ? 'All APIs operational' : 'Some APIs degraded',
          details: allApisAvailable ? 
            'All external data sources are responding normally.' : 
            'Binance API showing increased latency (320ms). Twitter API rate limit at 80%.'
        };
      }
    },
    { 
      id: 'sentiment-accuracy', 
      name: 'Sentiment Analysis', 
      type: 'sentiment',
      run: async (): Promise<Partial<TestResult>> => {
        // Simulate testing sentiment analysis
        await new Promise(resolve => setTimeout(resolve, 1700));
        const sentimentAccuracy = 70 + (Math.random() * 25);
        return {
          status: sentimentAccuracy > 85 ? 'success' : 'warning',
          duration: 1700,
          message: `Accuracy: ${sentimentAccuracy.toFixed(2)}%`,
          details: `Compared sentiment predictions with actual price movements for 200 sample points. ${
            sentimentAccuracy > 85 ? 'Strong correlation observed.' : 'Moderate correlation observed.'
          }`
        };
      }
    }
  ];

  // Test selection handlers
  const toggleTestType = (type: TestType) => {
    setSelectedTestTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Format time elapsed
  const formatTimeElapsed = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Run the selected tests
  const runTests = async () => {
    setIsRunningTests(true);
    setProgress(0);
    
    // Get the tests to run based on selected types
    const testsToRun = availableTests.filter(test => 
      selectedTestTypes.includes(test.type)
    );
    
    if (testsToRun.length === 0) {
      setIsRunningTests(false);
      return;
    }
    
    // Clear previous test results for the selected types
    setTestResults(prev => 
      prev.filter(result => !selectedTestTypes.includes(result.type))
    );
    
    let completedTests = 0;
    const newResults: TestResult[] = [];
    const timestamp = Date.now();
    
    for (const test of testsToRun) {
      try {
        // Create initial "running" state
        const initialResult: TestResult = {
          id: test.id,
          name: test.name,
          type: test.type,
          status: 'running',
          timestamp
        };
        
        // Add or update the result in state
        setTestResults(prev => [...prev, initialResult]);
        
        // Run the actual test
        const testResult = await test.run();
        
        // Update with completed result
        const finalResult: TestResult = {
          ...initialResult,
          ...testResult,
          status: testResult.status || 'success',
        };
        
        newResults.push(finalResult);
        completedTests++;
        setProgress((completedTests / testsToRun.length) * 100);
        
        // Update the results in state
        setTestResults(prev => 
          prev.map(r => r.id === test.id ? finalResult : r)
        );
      } catch (error) {
        // Handle test execution errors
        const errorResult: TestResult = {
          id: test.id,
          name: test.name,
          type: test.type,
          status: 'failed',
          message: 'Test execution error',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp
        };
        
        newResults.push(errorResult);
        completedTests++;
        setProgress((completedTests / testsToRun.length) * 100);
        
        // Update the results in state
        setTestResults(prev => 
          prev.map(r => r.id === test.id ? errorResult : r)
        );
      }
    }
    
    setLastRunTimestamp(timestamp);
    setIsRunningTests(false);
    
    // Optionally store results to localStorage or send to backend
    localStorage.setItem('cryptoPrediction_lastTestResults', JSON.stringify({
      results: [...newResults],
      timestamp
    }));
  };

  // Load previous test results on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem('cryptoPrediction_lastTestResults');
    if (savedResults) {
      try {
        const { results, timestamp } = JSON.parse(savedResults);
        setTestResults(results);
        setLastRunTimestamp(timestamp);
      } catch (error) {
        console.error('Error parsing saved test results:', error);
      }
    }
  }, []);

  // Get status icon based on test status
  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        );
      case 'idle':
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get test type icon based on test type
  const getTypeIcon = (type: TestType) => {
    switch (type) {
      case 'prediction':
        return <BarChart3 className="w-4 h-4" />;
      case 'dataIntegrity':
        return <CheckCircle className="w-4 h-4" />;
      case 'performance':
        return <Clock className="w-4 h-4" />;
      case 'api':
        return <Play className="w-4 h-4" />;
      case 'sentiment':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium flex items-center">
          <Play className="w-5 h-5 mr-2 text-blue-500" />
          System Tests
        </h3>
        {lastRunTimestamp && (
          <span className="text-xs text-gray-400">
            Last run: {formatTimeElapsed(lastRunTimestamp)}
          </span>
        )}
      </div>

      {/* Test Type Selection */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Select Test Categories</div>
        <div className="flex flex-wrap gap-2">
          {['prediction', 'dataIntegrity', 'performance', 'api', 'sentiment'].map((type) => (
            <button
              key={type}
              className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                selectedTestTypes.includes(type as TestType)
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
              onClick={() => toggleTestType(type as TestType)}
              disabled={isRunningTests}
            >
              {getTypeIcon(type as TestType)}
              <span className="ml-1">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <Button
        className="w-full mb-4"
        onClick={runTests}
        disabled={isRunningTests || selectedTestTypes.length === 0}
      >
        {isRunningTests ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
            Running Tests ({Math.round(progress)}%)
          </>
        ) : (
          'Run Tests'
        )}
      </Button>

      {/* Test Results */}
      <div className="space-y-2">
        {testResults.length > 0 ? (
          <>
            <div className="text-xs text-gray-400 mb-1">Test Results</div>
            {testResults.map((result) => (
              <div
                key={result.id}
                className="p-3 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-2 text-sm font-medium">{result.name}</span>
                  </div>
                  {result.duration && (
                    <span className="text-xs text-gray-400">{result.duration}ms</span>
                  )}
                </div>

                {result.message && (
                  <div className="mt-1 text-sm">
                    {result.message}
                  </div>
                )}

                {result.details && (
                  <div className="mt-1 text-xs text-gray-400">
                    {result.details}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Play className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No test results yet</p>
            <p className="text-xs mt-1">Select test categories and run tests</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TestRunner;