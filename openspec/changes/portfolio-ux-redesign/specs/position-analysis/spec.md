## ADDED Requirements

### Requirement: Asset Distribution Pie Charts

The system SHALL display pie charts showing the portfolio's asset distribution by multiple dimensions: 銀行 (Bank), 幣別 (Currency), 配息類型 (Dividend Type). The user SHALL be able to switch between dimensions via toggle buttons.

#### Scenario: Distribution by Currency

- **WHEN** the user views the 庫存分析 tab with the 幣別 dimension selected
- **THEN** a pie chart SHALL display the percentage of total portfolio value allocated to each currency (USD, NTD, CNY)
- **AND** each slice SHALL show the percentage and approximate NTD value

#### Scenario: Switching Distribution Dimension

- **WHEN** the user clicks the "依銀行" toggle
- **THEN** the pie chart SHALL update to show distribution by bank

### Requirement: Dividend Income Summary

The system SHALL display a chart showing monthly dividend income (non-cumulative) across all dividend-paying funds. Monthly dividend SHALL be calculated as the difference in cumulative dividend between adjacent months.

#### Scenario: Monthly Dividend Bar Chart

- **WHEN** the user views the dividend income section
- **THEN** a bar chart SHALL display the total monthly dividend income for each month
- **AND** each bar SHALL represent the sum of all funds' monthly dividends for that month

#### Scenario: First Month Handling

- **WHEN** calculating monthly dividends for the earliest available month
- **THEN** the system SHALL either omit the first month or display the cumulative dividend as-is, since no prior month exists for subtraction

### Requirement: Profit/Loss Ranking

The system SHALL display a horizontal bar chart ranking all funds by their profit/loss value, from highest to lowest.

#### Scenario: P/L Ranking Display

- **WHEN** the user views the 損益排行 section
- **THEN** a horizontal bar chart SHALL list all funds sorted by their latest `profit_loss` value
- **AND** profitable funds SHALL be colored in up-color (red) and loss-making funds in down-color (green)

#### Scenario: Filtered P/L Ranking

- **WHEN** the user has active filters from the Watchlist tab
- **THEN** the P/L ranking SHALL respect those filters and only show filtered funds

### Requirement: Cash Flow by Bank

The system SHALL display the cumulative dividend income by bank over time as a stacked bar chart, migrated from the existing overview.

#### Scenario: Bank Cash Flow Display

- **WHEN** the user views the cash flow section in the 庫存分析 tab
- **THEN** a stacked bar chart SHALL show cumulative dividends grouped by bank across months
