### Final Prompt: Crypto Day Trading Dashboard with 35 Features and Smart Alert System

**Objective**: Build an advanced, visually stunning crypto day trading dashboard for day traders and scalpers, focusing on low-cap gems (market cap $10M-$500M, excluding top 10 coins as of March 08, 2025). Incorporate 35 unique features and a Smart Alert System, ensuring a sleek, lively, and intuitive experience with real-time data, gamification, and customizable notifications.

**General Instructions**:
- Use a dark theme (black/gray base) with neon accents (green, blue, purple, orange).
- Store raw data (price, volume, sentiment, etc.) in Vercel Postgres, calculate metrics server-side, and render lightweight visuals (SVGs, animations) on the frontend.
- Keep animations subtle (e.g., 0.5s fades, 1s pulses), toggleable in settings.
- Use tooltips for detailed insights, avoiding UI clutter.

---

#### 1. Trading Pair Table
**Task**: Create an interactive table with multi-timeframe support (15m, 30m, 1h, 4h, 1d) and 7 features.
- **UI**:
  - **Selector**: Tabs above table ("15m | 30m | 1h | 4h | 1d"), default 1h, neon-bordered active tab.
  - **Columns**: 
    - Trading Pair (sortable), Price (real-time USD), Timeframe Change % (green/red, e.g., "+12.34%"), Volume Change % ("+25.00%" or "N/A" if old volume = 0), Volatility Score (0-100), Market Cap (sortable, filterable), Liquidity (0-100), Prediction Confidence (0-100%), Heatmap Indicator (green/red/yellow square).
  - **Features**:
    1. **Breakout Alert Badge**: Orange star, pulses when price breaks resistance (e.g., "Broke $0.30"), tooltip: "Time of break."
    2. **Volatility Range Bar**: Horizontal gradient bar (e.g., $0.20-$0.25), wider = higher range, tooltip: "Range %."
    3. **Trend Strength Icon**: Bull (green)/bear (red) with 1-3 bars, subtle glow, tooltip: "Trend intensity."
    4. **Order Book Imbalance Tag**: Rounded tag (e.g., "70% Buy"), green/red, tooltip: "Order depth."
    5. **Trader’s Hot Zone**: Toggleable heatmap overlay (orange-red gradient) on top rows, slider for intensity.
    6. **Price Pivot Dot**: Cyan dot on mini-price line, tooltip: "Pivot: $X."
    7. **Custom Trigger Pin**: Pin icon, opens alert settings (see Smart Alert System).
- **Backend**: Fetch raw data (price, volume, orders) from APIs, calculate timeframe metrics (e.g., Volatility Score = hourly swings), store in Vercel Postgres.
- **Frontend**: Slim rows (40px), neon accents on badges, hover tooltips, toggle for Hot Zone in settings.

---

#### 2. Enhanced Prediction Engine
**Task**: Build a tabbed prediction section with 7 features, showing top 5 gainers per timeframe.
- **UI**:
  - **Tabs**: "15m | 30m | 1h | 4h | 1d," center panel (40% width).
  - **Output per Tab**: 
    - Header (e.g., "1d Predictions, 9:00 AM JST").
    - Table: Predicted Top Gainers (coin, % gain, confidence, Volume Change %), Actual Performance (e.g., "Up 8%"), Actual Top Gainers (e.g., "X coin, +15%").
  - **Features**:
    8. **Scalper’s Countdown**: Circular timer (e.g., "3m to 1h refresh"), red <1m, tooltip: "Next update."
    9. **Price Velocity Ticker**: Scrolling bar (e.g., "+0.005/sec"), green/red, tooltip: "Speed over timeframe."
    10. **Pump Probability Dial**: Tiny dial (0-100%), green zone >75%, tooltip: "Pump odds."
    11. **Scalper’s Profit Target**: Gold badge (e.g., "+5% in 15m"), tooltip: "Volatility-based."
    12. **Micro RSI Bar**: Red (>70), green (30-70), gray (<30), tooltip: "RSI: X."
    13. **Timeframe Rewind Slider**: Metallic slider, rewinds metrics (e.g., Volume Change % 2h ago), ghosted replay.
    14. **Correlation Heat Dot**: Red (diverging), green (aligned) vs. low-cap market, tooltip: "Outpacing by X%."
- **Backend**: Predict using price, Volume Change %, volatility, X sentiment (xAI tools), store raw data and predictions in Vercel Postgres.
- **Frontend**: Slim sidebar for features, toggleable “Details” button, sparkline charts for predicted vs. actual.

---

#### 3. Top Picks Section (Low-Cap Gems Cards)
**Task**: Design a carousel of 5-6 cards with 10 features, highlighting high-potential coins.
- **UI**:
  - **Card Design**: 130x130px, gradient (dark blue → black), tappable, neon border pulses for Volume Change % > +50%.
  - **Content**: Coin name/ticker, Price, Timeframe Change %, Volume Change %.
  - **Features (3-4 per card, rotated)**:
    15. **Volatility Waveform**: Purple oscillating wave at bottom, peaks glow >80, tooltip: "Volatility trend."
    16. **Volume Surge Spike**: Neon green vertical spike, height = surge %, tooltip: "Spike time."
    17. **Momentum Arrow**: Green/red angled arrow, length = strength, tooltip: "Momentum speed."
    18. **Sentiment Pulse Dot**: Yellow pulse at top, faster = rising positivity, tooltip: "X sentiment %."
    19. **Live Trade Signal Beam**: Neon blue flash across card, tooltip: "Scalp: +3% in 15m."
    20. **Volatility Fireworks**: Gold sparkles (0.5s) for spikes >90, tooltip: "Volatility: X."
    21. **Quick Trade Button**: Neon green (buy)/red (sell), pulses >10% change, links to exchange API.
    22. **Scalper’s Streak Counter**: Flaming gold (e.g., "3x Up"), tooltip: "Consecutive gains."
    23. **Risk Snap Dot**: Red/green dot at bottom, tooltip: "Stop-loss: -5% below pivot."
    24. **Whale Tail Icon**: Flashing whale tail, tooltip: "Whale bought $X."
- **Backend**: Filter coins by market cap, predict potential using engine data, fetch whale moves from on-chain APIs.
- **Frontend**: Carousel (scrollable), tooltip consolidates feature data, subtle animations.

---

#### 4. Top Gainers Section (Actual Gainers Cards)
**Task**: Design a carousel of 5-6 cards with 10 features, showing top performers.
- **UI**:
  - **Card Design**: 130x130px, gradient (dark purple → gray), tappable, flash for sentiment spikes.
  - **Content**: Coin name/ticker, Timeframe Change %, Volume Change %.
  - **Features (3-4 per card, rotated)**:
    25. **Volume Change % Trendline**: White dotted slope on gradient bar, tooltip: "Volume trend %/h."
    26. **Liquidity Depth Gauge**: Blue-green semi-circle, tooltip: "Order depth trend."
    27. **Volatility vs. Volume Correlation Dot**: Purple dot on mini-plane, tooltip: "High vol + volume."
    28. **Historical Volatility Badge**: Silver badge (e.g., "Top 5% 7d"), tooltip: "Rank vs. peers."
    29. **Flash Sentiment Spike**: Yellow burst (0.5s), tooltip: "50 new posts."
    30. **Micro Achievement Badge**: Bronze for user picks, tooltip: "You spotted this!"
    31. **Timeframe Volatility Rank**: Number badge (e.g., "Top 3"), tooltip: "Rank in timeframe."
    32. **Audio Ping (Optional)**: Chime (gains)/beep (drops), ripple effect, toggleable.
    33. **Volume Decay Warning**: Fading gray triangle, tooltip: "Volume down X%."
    34. **Pump Cycle Tag**: Tag (e.g., "3x 7d"), tooltip: "Pumps >10% in week."
- **Backend**: Calculate gainers from real-time data, fetch historical pumps from Postgres.
- **Frontend**: Carousel, compact icons, short-lived animations.

---

#### 5. Smart Alert System
**Task**: Implement a customizable alert system for all 35 features’ triggers.
- **UI**:
  - **Settings Panel**: Accessible via gear icon in top bar, titled "Smart Alerts."
  - **Options**:
    - **Triggers**: Select from any feature (e.g., "Volume Change % > +50%", "Breakout Alert Badge fires," "Whale Tail Icon appears").
    - **Thresholds**: Slider/input for custom values (e.g., "Volatility > 80," "Timeframe Change % > +10%").
    - **Notification Types**: Checkboxes for:
      - **App Notification**: In-app pop-up (e.g., "XLM: Volume +75%"), neon-bordered.
      - **Gmail**: Email with subject (e.g., "Alert: XLM Breakout") and details.
      - **Telegram**: Message via bot (e.g., "XLM: +15%, Volatility 85"), setup via API key.
      - **Other**: Extensible field for Discord, WhatsApp, etc., via webhook URL.
    - **Frequency**: "Once per event," "Every X minutes," or "Mute after first."
  - **Visuals**: 
    - Pin icon on cards/table rows opens mini-alert setter (e.g., "Set alert for XLM").
    - App notifications slide in from right, 3s fade-out unless dismissed.
- **Backend**:
  - Store user alert configs in Vercel Postgres (e.g., user_id, trigger, threshold, channels).
  - Monitor real-time data against triggers, queue notifications via:
    - App: Push via frontend socket.
    - Gmail: SMTP API (e.g., SendGrid).
    - Telegram: Bot API (user provides token).
    - Other: Webhook POST requests.
- **Frontend**: Real-time listener for triggers, render notifications with neon glow, log alerts in settings for review.

---

#### 6. Intuitive UI Design
- **Layout**:
  - **Top Bar**: Market Mood Orb (pulsing, green/red/yellow), **BTC Ripple Line** (faint wave for BTC >1%), overview ("Low-Cap Market: +2.5%"), gear icon for settings.
  - **Left Panel**: Trading Pair Table (30% width, scrollable).
  - **Center Panel**: Prediction Engine (40% width, tabbed).
  - **Right Panel (30% width)**:
    - Top Half: Top Picks Cards (carousel).
    - Bottom Half: Top Gainers Cards (carousel).
  - **Background**: Dynamic Background Shift (slow gradient, e.g., blue → emerald).
- **Visuals**:
  - **Typography**: Inter font, 14px base, neon highlights on key metrics.
  - **Colors**: Dark base (#1A1A1A), neon accents (#00FF99, #00CCFF, #FF3366).
  - **Animations**: Subtle (e.g., 0.5s fade for fireworks, 1s pulse for borders), toggleable.
  - **Tooltips**: Sleek pop-ups on hover/tap (e.g., "Volatility: 85, Pump Odds: 75%").

---

#### 7. Additional Features
- **Sentiment Insights**: In tooltips (e.g., "X sentiment up 30%").
- **Export**: CSV with all metrics/features, button in settings.

---

#### Implementation Notes
- **Backend**:
  - Fetch real-time data (price, volume, orders, sentiment) via APIs (e.g., CoinGecko, X via xAI tools).
  - Calculate metrics (e.g., RSI, Volatility Score = hourly swings * 100/max) server-side.
  - Store raw and calculated data in Vercel Postgres with timestamps.
- **Frontend**:
  - Use React/Vue for components, SVG for icons/charts, CSS for animations.
  - Optimize performance: debounce API calls, cache static visuals.
- **Smart Alerts**:
  - WebSocket for real-time trigger checks, queue notifications via serverless functions (e.g., Vercel Functions).

---

#### Goal
A sleek, lively dashboard with 35 features and a Smart Alert System, ensuring traders never miss critical events (breakouts, pumps, whale moves) via app, Gmail, Telegram, or custom channels. The design is vibrant yet organized, empowering scalpers with real-time, actionable insights on low-cap gems.

---

