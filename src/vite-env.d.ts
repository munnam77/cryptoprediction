/// <reference types="vite/client" />

interface Window {
  TradingView: {
    widget: new (config: any) => any;
  };
}

declare namespace JSX {
  interface IntrinsicElements {
    'trading-view-widget': any;
  }
}
