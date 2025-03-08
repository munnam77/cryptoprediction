import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AdvancedChartProps {
  symbol: string;
  data: ChartData[];
  indicators: {
    showVolume: boolean;
    showMA: boolean;
    showBB: boolean;
  };
  onTimeframeChange: (timeframe: string) => void;
}

function AdvancedChart({ symbol, data, indicators, onTimeframeChange }: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { color: '#1a1e2c' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2f3f' },
        horzLines: { color: '#2a2f3f' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2a2f3f',
      },
      timeScale: {
        borderColor: '#2a2f3f',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    };

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      ...chartOptions,
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (indicators.showVolume) {
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });

      volumeSeries.setData(
        data.map((item) => ({
          time: item.time,
          value: item.volume,
          color: item.close > item.open ? '#26a69a' : '#ef5350',
        }))
      );
    }

    if (indicators.showMA) {
      const ma20 = calculateMA(data, 20);
      const ma50 = calculateMA(data, 50);

      chartRef.current.addLineSeries({
        color: '#2962FF',
        lineWidth: 1,
      }).setData(ma20);

      chartRef.current.addLineSeries({
        color: '#FF6D00',
        lineWidth: 1,
      }).setData(ma50);
    }

    if (indicators.showBB) {
      const bb = calculateBollingerBands(data);
      
      chartRef.current.addLineSeries({
        color: '#B71C1C',
        lineWidth: 1,
        lineStyle: 2,
      }).setData(bb.upper);

      chartRef.current.addLineSeries({
        color: '#1B5E20',
        lineWidth: 1,
        lineStyle: 2,
      }).setData(bb.lower);
    }
  }, [indicators, data]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{symbol} Chart</h2>
        <div className="flex space-x-2">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => onTimeframeChange(timeframe)}
              className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {timeframe.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

function calculateMA(data: ChartData[], period: number) {
  const ma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val.close, 0);
    ma.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return ma;
}

function calculateBollingerBands(data: ChartData[]) {
  const period = 20;
  const stdDev = 2;
  const bb = {
    upper: [],
    lower: [],
  };

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const ma = slice.reduce((acc, val) => acc + val.close, 0) / period;
    const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - ma, 2), 0) / period;
    const sd = Math.sqrt(variance);

    bb.upper.push({
      time: data[i].time,
      value: ma + stdDev * sd,
    });
    bb.lower.push({
      time: data[i].time,
      value: ma - stdDev * sd,
    });
  }

  return bb;
}

export default AdvancedChart;