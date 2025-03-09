// UIComponentTypes.ts
// This file contains TypeScript interfaces for all UI components used in the crypto dashboard

export interface QuickTradeButtonProps {
  symbol: string;
  price: number;
  action: 'buy' | 'sell';
}

export interface RiskSnapDotProps {
  riskScore: number;
  onClick?: () => void;
  className?: string;
}

export interface VolatilityWaveformProps {
  value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  className?: string;
}

export interface WhaleTailIconProps {
  whaleActivity: 'buying' | 'selling' | 'neutral';
  transactionSize: number;
  className?: string;
}

export interface TimeframeRewindSliderProps {
  value: number;
  onChange: (time: number) => void;
  className?: string;
}

export interface AudioPingProps {
  active: boolean;
  type: 'gain' | 'loss' | 'alert';
  onToggle?: () => void;
  className?: string;
}

export interface PriceVelocityTickerProps {
  value: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
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

export interface CorrelationHeatDotProps {
  value: number;
  symbols: [string, string];
  className?: string;
}

export interface SentimentPulseDotProps {
  value: number;
  source: 'social' | 'news' | 'technical';
  className?: string;
}

export interface LiveTradeSignalBeamProps {
  signal: 'buy' | 'sell' | 'neutral';
  intensity: number;
  className?: string;
}

export interface PredictionEngineProps {
  timeframe: '15m' | '30m' | '1h' | '4h' | '1d';
  data: {
    pair: string;
    prediction: 'up' | 'down' | 'sideways';
    confidence: number;
    targetPrice?: number;
    timeframe: string;
  }[];
  className?: string;
}

export interface ScalpersProfitTargetProps {
  price: number;
  targets: number[];
  stopLoss?: number;
  className?: string;
}

export interface ScalpersCountdownProps {
  endTime: number;
  severity: 'low' | 'medium' | 'high';
  className?: string;
}

export interface ScalpersStreakCounterProps {
  currentStreak: number;
  type: 'win' | 'loss';
  className?: string;
}

export interface HistoricalVolatilityBadgeProps {
  value: number;
  average: number;
  range: [number, number];
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
  stage: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  probability: number;
  className?: string;
}

export interface MicroAchievementBadgeProps {
  achievement: {
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  className?: string;
}

export interface VolatilityFireworksProps {
  spikes: {
    pair: string;
    timestamp: number;
    intensity: number;
  }[];
  className?: string;
}

export interface LiquidityDepthGaugeProps {
  depth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  className?: string;
}

export interface BreakoutAlertProps {
  type: 'support' | 'resistance';
  price: number;
  breakoutPrice: number;
  time: string;
  className?: string;
}

export interface VolatilityRangeBarProps {
  value: number;
  range: [number, number];
  className?: string;
}

export interface TrendStrengthIconProps {
  trend: 'bull' | 'bear';
  strength: 1 | 2 | 3;
  className?: string;
}

export interface OrderBookImbalanceTagProps {
  ratio: number;
  volume: number;
  className?: string;
}

export interface TradersHotZoneProps {
  zones: {
    price: number;
    heat: number;
  }[];
  price: number;
  className?: string;
}

export interface PricePivotDotProps {
  price: number;
  pivot: number;
  type: 'support' | 'resistance';
  className?: string;
}

export interface CustomTriggerPinProps {
  active: boolean;
  price: number;
  target: number;
  className?: string;
}

export interface MarketDataPoint {
  pair: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  indicators: {
    rsi: number;
    volatility: number;
    sentiment: number;
    momentum: number;
  };
}
