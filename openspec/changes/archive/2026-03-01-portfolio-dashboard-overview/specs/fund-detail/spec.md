## ADDED Requirements

### Requirement: Individual Asset Trend Chart

The system SHALL provide a detailed view tracking an individual fund or certificate's performance over time.

#### Scenario: Viewing a Fund's History

- **WHEN** a specific fund is selected from the dashboard
- **THEN** a chart displays its current value, cumulative dividends, and calculated profit/loss metrics over the tracked months.

### Requirement: Return Mode Toggle

The system SHALL allow users to toggle between "dividend-inclusive" (含息) and "dividend-exclusive" (不含息) return views for individual funds, analogous to stock adjusted vs. unadjusted prices.

#### Scenario: Switching to Dividend-Inclusive View

- **WHEN** comparing fund performances and the "dividend-inclusive" toggle is ON
- **THEN** the chart visualizes the total return (capital gains + accumulated dividends).

#### Scenario: Switching to Dividend-Exclusive View

- **WHEN** the "dividend-exclusive" toggle is selected
- **THEN** the chart visualizes purely the capital gains/losses based strictly on the current asset value versus cost.

### Requirement: Visual Price Movement Indicators

The system SHALL automatically calculate and visually indicate period-over-period price movements (up/down/flat) rather than relying on flawed manual inputs (such as the legacy "DU" column).

#### Scenario: Month-over-Month Gain Indicates Upward Trend

- **WHEN** a fund's value in the current month is higher than the previous month
- **THEN** the interface denotes an upward trajectory (e.g., green indicator or upward arrow).

#### Scenario: Month-over-Month Loss Indicates Downward Trend

- **WHEN** a fund's value is lower than the previous month
- **THEN** the interface denotes a downward trajectory (e.g., red indicator or downward arrow).
