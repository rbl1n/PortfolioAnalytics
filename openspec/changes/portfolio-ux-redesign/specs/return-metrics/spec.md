## ADDED Requirements

### Requirement: Annualized Return Calculation

The system SHALL calculate two types of annualized return for each fund:

1. **Actual Annualized Return** (實際年化報酬): Reflects the investor's real return, including dividends and cost basis. Formula: `annualized = (1 + totalReturn) ^ (12/months) - 1`, where `totalReturn = (currentValue + cumulativeDividend - costBasis) / costBasis`.
2. **Fund Performance Annualized** (基金表現年化): Reflects the fund's performance including dividends but excluding investor's cost. Derived from the `return_rate` field.

Cost basis is derived as: `costBasis = currentValue - profitLoss` (to be verified with data-parser logic).

#### Scenario: Positive Annualized Return

- **WHEN** a fund has a positive total return over its holding period
- **THEN** the annualized return SHALL be a positive percentage
- **AND** SHALL be displayed in up-color (red per Taiwan convention)

#### Scenario: Negative Annualized Return

- **WHEN** a fund has a negative total return
- **THEN** the annualized return SHALL be a negative percentage
- **AND** SHALL be displayed in down-color (green per Taiwan convention)

#### Scenario: Insufficient Data

- **WHEN** a fund has fewer than 2 months of data or cost basis is zero/negative
- **THEN** the annualized return SHALL display "N/A" instead of a calculated value

### Requirement: Monthly Dividend Derivation

The system SHALL calculate single-month dividend income by subtracting the previous month's cumulative dividend from the current month's cumulative dividend: `monthlyDiv = cumDiv[currentMonth] - cumDiv[prevMonth]`.

#### Scenario: Normal Monthly Dividend

- **WHEN** both the current and previous month's cumulative dividend values exist
- **THEN** the monthly dividend SHALL equal their difference

#### Scenario: First Available Month

- **WHEN** calculating for the earliest month in the dataset (no previous month)
- **THEN** the monthly dividend SHALL be displayed as the cumulative value itself or omitted

### Requirement: Currency Conversion for Aggregation

The system SHALL convert foreign currency values to NTD-equivalent using stored exchange rates when aggregating across currencies. The conversion rates SHALL be clearly labeled as approximate (約當值).

#### Scenario: USD to NTD Conversion

- **WHEN** aggregating a USD-denominated fund's value with NTD funds
- **THEN** the system SHALL multiply the USD value by the stored exchange rate (currently hardcoded)
- **AND** the aggregated display SHALL indicate "約當NTD"
