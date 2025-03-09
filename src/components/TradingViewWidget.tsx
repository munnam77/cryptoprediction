import React from 'react';
import { TradingViewWidgetProps } from '../types/ComponentTypes';

declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => any;
    };
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  interval = '1h',
  theme = 'dark',
  className = ''
}) => {
  const containerId = `tradingview_${Math.random().toString(36).substring(7)}`;

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval,
          container_id: containerId,
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          studies: ['ROC@tv-basicstudies'],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, interval, theme, containerId]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div id={containerId} className="w-full h-full" />
    </div>
  );
};

export default TradingViewWidget;