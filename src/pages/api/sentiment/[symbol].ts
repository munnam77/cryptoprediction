import { NextApiRequest, NextApiResponse } from 'next';
import { SentimentService } from '../../../services/sentiment/SentimentService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { symbol } = req.query;
    
    if (!symbol || Array.isArray(symbol)) {
      return res.status(400).json({ message: 'Invalid symbol parameter' });
    }

    // Remove any USDT suffix if present (e.g., "BTCUSDT" -> "BTC")
    const cleanedSymbol = symbol.replace(/USDT$/, '');
    
    // Fetch sentiment data from the SentimentService
    const sentimentData = await SentimentService.getSentiment(cleanedSymbol);
    
    if (!sentimentData) {
      return res.status(404).json({ message: 'Sentiment data not found' });
    }

    return res.status(200).json(sentimentData);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}