import { useState, useEffect, useCallback } from 'react';
import { MarketData } from '../components/LiveMarketTracker';

// Binance API endpoints
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_TICKER_24HR = `${BINANCE_API_BASE}/ticker/24hr`;
const BINANCE_EXCHANGE_INFO = `${BINANCE_API_BASE}/exchangeInfo`;
const BINANCE_KLINES = `${BINANCE_API_BASE}/klines`;

// Map timeframes to Binance kline intervals
const timeframeToInterval: Record<string, string> = {
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d'
};

// Cache duration in milliseconds
const CACHE_DURATION = 30 * 1000; // 30 seconds

export function useBinanceData() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [activeSymbols, setActiveSymbols] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  // Function to determine if a pair is a "gem" (not in top 10-20 market cap)
  const isGemPair = (symbol: string): boolean => {
    const topCoins = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
      'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'LINKUSDT', 'AVAXUSDT',
      'MATICUSDT', 'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'UNIUSDT',
      'XLMUSDT', 'ICPUSDT', 'FILUSDT', 'VETUSDT', 'SANDUSDT'
    ];
    
    // Include top coins but mark them differently in UI
    return true; // Keep all coins but will be marked in UI
  };

  // Function to calculate volatility
  const calculateVolatility = (highPrices: number[], lowPrices: number[]): number => {
    if (highPrices.length === 0 || lowPrices.length === 0) return 0;

    // Calculate average price range as percentage
    let sum = 0;
    for (let i = 0; i < highPrices.length; i++) {
      const highPrice = highPrices[i];
      const lowPrice = lowPrices[i];
      const avgPrice = (highPrice + lowPrice) / 2;
      const range = ((highPrice - lowPrice) / avgPrice) * 100;
      sum += range;
    }
    
    return sum / highPrices.length;
  };

  // Fetch active trading pairs from Binance
  const fetchActiveSymbols = useCallback(async () => {
    try {
      const response = await fetch(BINANCE_EXCHANGE_INFO);
      if (!response.ok) throw new Error('Failed to fetch exchange info');

      const data = await response.json();
      
      // Filter for active USDT trading pairs
      const activePairs = data.symbols
        .filter((symbol: any) => 
          symbol.status === 'TRADING' && 
          symbol.symbol.endsWith('USDT') &&
          symbol.isSpotTradingAllowed
        )
        .map((symbol: any) => symbol.symbol);
      
      setActiveSymbols(activePairs);
      return activePairs;
    } catch (err) {
      console.error('Error fetching active symbols:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching active symbols');
      return [];
    }
  }, []);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(`${BINANCE_WS_BASE}/!ticker@arr`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setError(null);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          const updatedData = data
            .filter(ticker => 
              ticker.s.endsWith('USDT') && 
              !['USDC', 'USDT', 'BUSD', 'DAI', 'UST'].some(pair => ticker.s.endsWith(pair))
            )
            .map(ticker => ({
              symbol: ticker.s,
              price: parseFloat(ticker.c),
              priceChange: parseFloat(ticker.p),
              priceChangePercent: parseFloat(ticker.P),
              volume: parseFloat(ticker.v),
              quoteVolume: parseFloat(ticker.q),
              lastUpdated: Date.now()
            }));
          
          setMarketData(updatedData);
          setLastUpdated(Date.now());
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        setError('Error processing market data');
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(initializeWebSocket, 5000);
    };
  }, []);

  // Function to fetch historical price data with rate limiting
  const fetchHistoricalData = useCallback(async (symbol: string, timeframe: string, limit: number = 30) => {
    const interval = timeframeToInterval[timeframe];
    
    // Add delay between requests to avoid rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Add delay before each request
      await delay(100);
      
      const response = await fetch(`${BINANCE_KLINES}?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      
      // Check for rate limit headers
      const remaining = response.headers.get('x-mbx-used-weight-1m');
      if (remaining && parseInt(remaining) > 1000) {
        // If close to rate limit, add longer delay
        await delay(1000);
      }
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit hit, wait and retry
          await delay(2000);
          return fetchHistoricalData(symbol, timeframe, limit);
        }
        throw new Error(`Failed to fetch historical data for ${symbol}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process kline data [time, open, high, low, close, volume, ...]
      return data.map((kline: any) => ({
        time: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));
    } catch (err) {
      console.warn(`Error fetching historical data for ${symbol}:`, err);
      return [];
    }
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    initializeWebSocket();
    
    // Fetch initial active symbols
    fetchActiveSymbols();

    return () => {
      // Cleanup WebSocket connection when component unmounts
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [initializeWebSocket, fetchActiveSymbols]);

  // Function to refresh market data manually if needed
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchActiveSymbols();
      if (activeSymbols.length === 0) {
        throw new Error('No active trading pairs found');
      }
      
      // Fetch 24h ticker data for all symbols
      const response = await fetch(BINANCE_TICKER_24HR);
      if (!response.ok) throw new Error('Failed to fetch ticker data');
      
      const tickerData = await response.json();
      
      // Filter for active USDT pairs
      const filteredData = tickerData.filter((ticker: any) => 
        symbols.includes(ticker.symbol) && ticker.symbol.endsWith('USDT')
      );
      
      // Process the data with additional metrics
      const processedData: MarketData[] = [];
      
      const timeframes = ['15m', '30m', '1h', '4h', '1d'];
      
      for (const ticker of filteredData) {
        // Skip if not interested in this pair
        if (!isGemPair(ticker.symbol)) continue;
        
        // Initialize data structure with 24h information
        const data: MarketData = {
          symbol: ticker.symbol,
          price: parseFloat(ticker.lastPrice),
          priceChangePercent: {
            '24h': parseFloat(ticker.priceChangePercent)
          },
          volumeChangePercent: {
            '24h': 0 // Will calculate from historical data
          },
          volume24h: parseFloat(ticker.volume),
          volatility: {
            '24h': parseFloat(ticker.priceChangePercent) * 0.5 // Approximation until we get historical data
          },
          lastUpdated: new Date().toISOString()
        };
        
        // Fetch historical data for all timeframes
        for (const timeframe of timeframes) {
          try {
            // Get appropriate limit based on timeframe
            const limit = 
              timeframe === '15m' ? 16 :
              timeframe === '30m' ? 16 :
              timeframe === '1h' ? 24 :
              timeframe === '4h' ? 30 :
              timeframe === '1d' ? 30 : 30;
            
            const historicalData = await fetchHistoricalData(ticker.symbol, timeframe, limit);
            
            if (historicalData.length > 1) {
              // Calculate price change percentage
              const currentPrice = historicalData[historicalData.length - 1].close;
              const pastPrice = historicalData[0].open;
              const priceChange = ((currentPrice - pastPrice) / pastPrice) * 100;
              data.priceChangePercent[timeframe] = priceChange;
              
              // Calculate volume change
              const currentVolume = historicalData.slice(-Math.min(3, historicalData.length)).reduce(
                (sum, item) => sum + item.volume, 0
              );
              const pastVolume = historicalData.slice(0, Math.min(3, historicalData.length)).reduce(
                (sum, item) => sum + item.volume, 0
              );
              
              if (pastVolume > 0) {
                data.volumeChangePercent[timeframe] = ((currentVolume - pastVolume) / pastVolume) * 100;
              } else {
                data.volumeChangePercent[timeframe] = 0;
              }
              
              // Calculate volatility
              const highPrices = historicalData.map(item => item.high);
              const lowPrices = historicalData.map(item => item.low);
              data.volatility[timeframe] = calculateVolatility(highPrices, lowPrices);
            } else {
              // If not enough historical data, use 24h values as fallback
              data.priceChangePercent[timeframe] = data.priceChangePercent['24h'];
              data.volumeChangePercent[timeframe] = 0;
              data.volatility[timeframe] = data.volatility['24h'];
            }
          } catch (err) {
            console.warn(`Error processing ${timeframe} data for ${ticker.symbol}:`, err);
            data.priceChangePercent[timeframe] = 0;
            data.volumeChangePercent[timeframe] = 0;
            data.volatility[timeframe] = 0;
          }
        }
        
        processedData.push(data);
      }
      
      setMarketData(processedData);
      setLastFetchTime(now);
      
      // Cache the data to localStorage for quick initial load
      try {
        localStorage.setItem('cryptoPrediction_marketData', JSON.stringify({
          data: processedData,
          timestamp: now
        }));
      } catch (err) {
        console.warn('Failed to cache market data to localStorage:', err);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching market data');
      
      // Try to use cached data if available
      try {
        const cachedData = localStorage.getItem('cryptoPrediction_marketData');
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (now - timestamp < 3600 * 1000) { // Use cache if less than 1 hour old
            setMarketData(data);
          }
        }
      } catch (cacheErr) {
        console.warn('Failed to load cached market data:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSymbols, fetchActiveSymbols, fetchHistoricalData, lastFetchTime]);

  // Function to manually refresh data
  const refreshData = useCallback(() => {
    fetchMarketData(true);
  }, [fetchMarketData]);

  // Initialize data on component mount with improved error handling and recovery
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds

    const loadData = async () => {
      // Try to load cached data first for immediate display
      try {
        const cachedData = localStorage.getItem('cryptoPrediction_marketData');
        if (cachedData && isMounted) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          if (now - timestamp < CACHE_DURATION * 2) { // More lenient cache duration for initial load
            setMarketData(data);
            setLastFetchTime(timestamp);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.warn('Failed to load cached market data:', err);
      }

      // Fetch fresh data with retry logic
      const fetchWithRetry = async () => {
        try {
          await fetchMarketData(true);
          retryCount = 0; // Reset retry count on success
        } catch (error) {
          console.error('Error fetching market data:', error);
          if (retryCount < MAX_RETRIES && isMounted) {
            retryCount++;
            setTimeout(fetchWithRetry, RETRY_DELAY);
          }
        }
      };

      await fetchWithRetry();
    };

    loadData();

    // Set up interval for periodic refresh with error handling
    const intervalId = setInterval(async () => {
      if (isMounted) {
        try {
          await fetchMarketData();
        } catch (error) {
          console.error('Error in periodic refresh:', error);
        }
      }
    }, CACHE_DURATION + 5000); // Refresh every cache duration + 5s

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchMarketData]);

  return {
    marketData,
    isLoading,
    error,
    refreshData
  };
}

export default useBinanceData;