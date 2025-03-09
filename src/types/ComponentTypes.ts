// Component prop type definitions
export interface PriceVelocityTickerProps {
  velocity: number;
  velocityTrend: 'accelerating' | 'decelerating' | 'stable';
  className?: string;
}

export interface VolatilityRangeBarProps {
  volatility: number;
  range: [number, number];
  className?: string;
}

export interface OrderBookImbalanceTagProps {
  imbalance: number;
  volume: number;
  className?: string;
}

export interface TrendStrengthIconProps {
  trend: 'bull' | 'bear';
  strength: 1 | 2 | 3;
  className?: string;
}

export interface TradersHotZoneProps {
  heatZones: Array<{
    price: number;
    intensity: number;
  }>;
  currentPrice: number;
  className?: string;
}

export interface QuickTradeButtonProps {
  symbol: string;
  action: 'buy' | 'sell';
  price: number;
  className?: string;
}

export interface RiskSnapDotProps {
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  className?: string;
  onClick?: () => void;
}

export interface VolatilityWaveformProps {
  volatilityValue: number;
  volatilityTrend: 'increasing' | 'decreasing' | 'stable';
  className?: string;
}

export interface WhaleTailIconProps {
  activity: 'buying' | 'selling' | 'neutral';
  transactionSize: number;
  className?: string;
}

export interface TimeframeRewindSliderProps {
  currentTime: number;
  onTimeChange: (timestamp: number) => void;
  className?: string;
}

export interface CorrelationHeatDotProps {
  correlation: number;
  pair: [string, string];
  className?: string;
}

export interface SentimentPulseDotProps {
  sentiment: number;
  source: 'social' | 'news' | 'technical';
  className?: string;
}

export interface PredictionEngineProps {
  predictions: Array<{
    pair: string;
    direction: 'up' | 'down' | 'sideways';
    confidence: number;
    targetPrice: number;
    timeframe: string;
  }>;
  className?: string;
}

export interface FlashSentimentSpikeProps {
  intensity: number;
  threshold: number;
  className?: string;
}

export interface VolumeDecayWarningProps {
  decay: number;
  threshold: number;
  className?: string;
}

export interface PumpCycleTagProps {
  cycleStage: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  probability: number;
  className?: string;
}

export interface PumpProbabilityDialProps {
  probability: number;
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  className?: string;
}

export interface MicroRSIBarProps {
  value: number;
  className?: string;
}

export interface TradingViewWidgetProps {
  symbol: string;
  interval: string;
  theme?: 'light' | 'dark';
  className?: string;
}