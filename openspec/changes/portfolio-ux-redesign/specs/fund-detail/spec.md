## MODIFIED Requirements

### Requirement: Individual Asset Trend Chart

The system SHALL provide a detailed view tracking an individual fund or certificate's performance over time. This view is now the primary content of the 走勢分析 (Chart) Tab, driven by the symbol context from the Watchlist.

#### Scenario: Viewing a Fund's History

- **WHEN** a specific fund is selected (via Watchlist click or Chart tab selector)
- **THEN** a line chart SHALL display its monthly values over the tracked months
- **AND** the chart SHALL support multi-line comparison with up to 5 funds

### Requirement: Return Mode Toggle

The system SHALL allow users to toggle between "dividend-inclusive" (含息) and "dividend-exclusive" (不含息) return views for the trend chart.

#### Scenario: Switching to Dividend-Inclusive View

- **WHEN** the "含息" toggle is active
- **THEN** the chart SHALL visualize the total return (capital gains + accumulated dividends)

#### Scenario: Switching to Dividend-Exclusive View

- **WHEN** the "不含息" toggle is selected
- **THEN** the chart SHALL visualize purely the capital gains/losses based on current asset value versus cost

### Requirement: Visual Price Movement Indicators

The system SHALL automatically calculate and visually indicate period-over-period price movements (up/down/flat) in the Watchlist table cells, using ▲/▼/— indicators with appropriate colors (red for up, green for down per Taiwan convention).

#### Scenario: Month-over-Month Gain Indicates Upward Trend

- **WHEN** a fund's value in the current month is higher than the previous month
- **THEN** the Watchlist row SHALL display ▲ in up-color (red)

#### Scenario: Month-over-Month Loss Indicates Downward Trend

- **WHEN** a fund's value is lower than the previous month
- **THEN** the Watchlist row SHALL display ▼ in down-color (green)

## ADDED Requirements

### Requirement: Annualized Return Display

The system SHALL display both actual annualized return and fund performance annualized return alongside the trend chart for the selected fund.

#### Scenario: Annualized Return Above Chart

- **WHEN** a fund is displayed in the Chart tab
- **THEN** the system SHALL show a summary card above the chart containing: fund name, current value, actual annualized return %, fund performance annualized return %, cumulative dividend, and month-over-month trend
