import { useState, useEffect } from 'react';
import { 
  get24hrTickers, 
  subscribeToTickers, 
  unsubscribeFromTickers,
  TickerData 
} from '../services/binance';

export function useBinanceData() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeTickers() {
      try {
        const initialData = await get24hrTickers();
        setTickers(initialData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch initial data');
        setLoading(false);
      }
    }

    initializeTickers();

    subscribeToTickers((data) => {
      setTickers(data);
    });

    return () => {
      unsubscribeFromTickers();
    };
  }, []);

  return { tickers, loading, error };
}