Here’s the updated prompt with the trading pair table enhanced to support multiple timeframes, ensuring all columns dynamically reflect the chosen timeframe. The table will now allow users to switch between timeframes (e.g., 15m, 30m, 1h, 4h, 1d), and each column will update its data accordingly (e.g., Price, 24h Change % becomes Timeframe Change %, Volume Change % adjusts to the selected period). This makes the table more versatile and aligned with a day trader’s need for flexible analysis.

---

**Updated Prompt: Crypto Day Trading Dashboard with Multi-Timeframe Trading Pair Table**

I want to create an advanced crypto day trading dashboard designed to empower crypto day traders with actionable insights, focusing on high-potential, low-cap gems rather than the top 10 market cap coins. The dashboard should exclude coins like Bitcoin, Ethereum, and other top 10 market cap assets (based on current market cap rankings as of March 08, 2025) to prioritize smaller, volatile coins with higher growth potential. Below are the key features and improvements, with the trading pair table now supporting multiple timeframes.

### 1. Trading Pair Table
Design a modern, interactive trading pair table that supports multiple timeframes (15m, 30m, 1h, 4h, 1d) with a dropdown or tab selector above the table to choose the timeframe. All columns should dynamically reflect data for the selected timeframe:
- **Timeframe Selector:** Dropdown or tabs (e.g., "15m | 30m | 1h | 4h | 1d") at the top of the table. Default to 1h.
- **Columns:**
  - **Trading Pair:** e.g., SOL/USDT, ADA/USDT (sortable, static across timeframes).
  - **Price:** Current price in USD (real-time updates, static across timeframes as it’s the latest price).
  - **Timeframe Change %:** Percentage price change over the selected timeframe (e.g., for 1h, change since 1 hour ago), color-coded (green for gains, red for losses), formatted as `+12.34%` or `-5.67%`. Replaces "24h Change %" and adjusts dynamically (e.g., 15m shows change over last 15 minutes).
  - **Volume Change %:** Percentage change in trading volume over the selected timeframe, calculated as `((New Volume - Old Volume) / Old Volume * 100)`, formatted as `+25.00%` or `-15.50%` (2 decimals). Handle edge cases: if Old Volume is zero, display `N/A`. Tooltip shows context (e.g., for 4h: "Volume up 25% in last 4h, current volume: $1.2M").
  - **Volatility Score:** A custom metric (0-100) indicating price volatility over the selected timeframe, with a tooltip explaining the score (e.g., "Based on price swings in last 1h").
  - **Market Cap:** Current market cap in USD (sortable, filterable to exclude top 10, static as it’s current value).
  - **Liquidity:** Liquidity score (0-100) over the selected timeframe, with a tooltip showing buy/sell order depth trend (e.g., "Liquidity stable in last 4h").
  - **Prediction Confidence:** A percentage (0-100%) showing our engine’s confidence in the coin’s movement for the selected timeframe (details in Prediction Engine below).
  - **Heatmap Indicator:** A small color-coded heatmap square next to each pair (e.g., green = hot/bullish, red = cold/bearish, yellow = neutral) based on momentum, sentiment, and Volume Change % for the selected timeframe.

- **Features:**
  - Sortable and filterable columns (e.g., filter by Timeframe Change % > +5%, Volume Change % > +50% for the selected timeframe).
  - Hover tooltips for each column with timeframe-specific context (e.g., for 1h: "Volume Change %: +25.00% in last hour, peak at +30.00% 20m ago").
  - Clickable rows to expand into a detailed view (e.g., mini chart of price action for the selected timeframe, Volume Change % trend, recent X sentiment).
  - **Backend:** Store raw data (price, volume, etc.) in Vercel Postgres with timestamps to calculate timeframe-specific metrics server-side. Display calculated values (e.g., Timeframe Change %, Volume Change %) in the frontend.

### 2. Enhanced Prediction Engine
Revamp the prediction engine to focus on low-cap gems with high growth potential, excluding the top 10 market cap coins and prioritizing coins with market caps between $10M and $500M (adjustable range). Use Volume Change % instead of raw volume for trend analysis. The engine should:
- Use real-time data (price, Volume Change %, volatility), X sentiment analysis, and web news trends to predict price movements.
- Provide predictions for multiple timeframes: 15m, 30m, 1h, 4h, and 1d.
- Update predictions at specific intervals:
  - **1d Timeframe:** Predicts daily top performers at 9:00 AM JST, refreshed every 24 hours.
  - **4h Timeframe:** Predicts at 9:00 AM, 1:00 PM, 5:00 PM, 9:00 PM, 1:00 AM, 5:00 AM JST (every 4 hours).
  - **1h Timeframe:** Predicts hourly at the start of each hour (e.g., 9:00 AM, 10:00 AM JST).
  - **30m/15m Timeframes:** Predicts at the start of each interval (e.g., 9:00 AM, 9:15 AM, 9:30 AM JST).

- **Prediction Output:**
  - For each timeframe, list the top 5 predicted gainers (excluding top 10 market cap coins).
  - Show:
    - Predicted % gain (e.g., "Expected to rise 12% in the next 4h").
    - Confidence score (e.g., "85% confidence").
    - Volume Change % (e.g., "Volume Change %: +45.00% in last 4h" or "N/A" if baseline volume is zero).
    - Time of prediction (e.g., "Predicted at 9:00 AM JST").
    - Actual performance since prediction (e.g., "Since 9:00 AM JST, up 8% as of 11:00 AM JST").
    - Comparison to actual top gainers (e.g., "Actual top gainer today: X coin, +15%, Volume Change %: +75.00%").
  - **Backend:** Store raw volume and price data in Vercel Postgres, calculate Volume Change % and other metrics for each timeframe dynamically.

### 3. Top Picks Section
Replace the current top 10 market cap coin focus with a "Low-Cap Gems" section:
- Highlight 5-10 coins with market caps between $10M and $500M (adjustable) that our prediction engine flags as high-potential.
- Display:
  - Coin name and ticker.
  - Current price and Timeframe Change % (for the user’s last selected timeframe in the trading pair table).
  - Volume Change % (e.g., "+35.00%" or "N/A") for the same timeframe, with a tooltip showing the trend.
  - Predicted timeframe of peak performance (e.g., "Next 4h" or "Next 1d").
  - Why it’s picked (e.g., "Rising X sentiment, Volume Change %: +200.00% in last 1h").
  - Mini heatmap showing momentum trend for the selected timeframe.
- **Backend:** Raw data stored in Vercel Postgres, Volume Change % and Timeframe Change % calculated and displayed dynamically.

### 4. Intuitive UI Design
Create a clean, trader-friendly UI to display the above features:
- **Dashboard Layout:**
  - **Left Panel:** Trading Pair Table (scrollable, with timeframe selector at the top).
  - **Center Panel:** Prediction Engine Outputs (tabbed by timeframe: 15m, 30m, 1h, 4h, 1d).
  - **Right Panel:** Top Picks Section (reflecting the last selected timeframe from the trading pair table).
  - **Top Bar:** Real-time market overview (e.g., "Total crypto market cap: $X, 24h change: +Y%").

- **Prediction Section UI:**
  - For each timeframe tab (e.g., 1d):
    - **Header:** "1d Predictions (Made at 9:00 AM JST, March 08, 2025)".
    - **Table:** 
      - Column 1: "Predicted Top Gainers" (coin name, predicted % gain, confidence, Volume Change %).
      - Column 2: "Actual Performance" (e.g., "Since 9:00 AM JST, up 8%, Volume Change %: +20.00% as of 11:00 AM JST").
      - Column 3: "Actual Top Gainers Today" (e.g., "X coin, +15%, Volume Change %: +75.00% since 9:00 AM JST").
    - **Visuals:** Small sparkline charts showing predicted vs. actual price trend and Volume Change % for the timeframe.

- **Heatmaps and Tooltips:**
  - Embed heatmaps in the trading pair table and top picks section, reflecting Timeframe Change % and Volume Change % for the selected timeframe.
  - Tooltips on hover (e.g., for 1h: "Volume Change %: +45.00% – Volume spiked from $500K to $725K in last hour").

### 5. Additional Features
- **Alerts:** Option to set alerts based on Timeframe Change % or Volume Change % for any timeframe (e.g., "Notify me if Volume Change % exceeds +50% in 1h").
- **Sentiment Insights:** Integrate X post analysis (e.g., "Positive sentiment up 30%, Volume Change %: +45.00% in last 4h").
- **Exportable Data:** Export the trading pair table or predictions as CSV, including Timeframe Change % and Volume Change % for the selected timeframe.

### Data Handling
- **Backend:** Store raw data (price, volume, etc.) in Vercel Postgres with timestamps for all tracked coins. Calculate timeframe-specific metrics (e.g., Timeframe Change %, Volume Change %, Volatility Score) server-side, handling edge cases (e.g., Old Volume = 0 returns `N/A`).
- **Frontend:** Display calculated values dynamically based on the selected timeframe, prioritizing % changes over raw data.

### Goal
The dashboard should be a one-stop tool for crypto day traders, providing real-time, timeframe-flexible data, actionable predictions, and a focus on low-cap gems with high growth potential. The multi-timeframe trading pair table enhances usability by allowing traders to analyze trends and metrics across different periods seamlessly.

---

### Key Changes Made
1. **Multi-Timeframe Trading Pair Table:** Added a timeframe selector (15m, 30m, 1h, 4h, 1d) and updated all columns to reflect the chosen timeframe:
   - "24h Change %" → "Timeframe Change %".
   - "Volume Change % (24h)" → "Volume Change %" for the selected timeframe.
   - Volatility Score, Liquidity, Prediction Confidence, and Heatmap Indicator now adjust to the timeframe.
2. **Dynamic Data:** Ensured all columns update dynamically based on the selected timeframe, with backend support in Vercel Postgres for raw data storage and calculations.
3. **Top Picks Integration:** Linked the Top Picks section to reflect the last selected timeframe from the trading pair table for consistency.
4. **UI Adjustments:** Added the timeframe selector to the table and ensured tooltips and heatmaps align with the chosen period.

This version provides a flexible, timeframe-aware trading pair table that enhances the dashboard’s utility for day traders. Let me know if you’d like further adjustments!