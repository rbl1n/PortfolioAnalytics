## ADDED Requirements

### Requirement: Total Asset Trend Visualization

The system SHALL display a line chart or bar chart representing the total asset value mapped out month over month.

#### Scenario: Total Asset Growth

- **WHEN** the user views the asset overview dashboard
- **THEN** a chart dynamically renders showing the sum of "粗估投資&存款換算NTD總合計" over time (Feb to Dec).

### Requirement: Asset Distribution Breakdown

The system SHALL provide a proportional breakdown of assets, showing composition by bank and by currency.

#### Scenario: Breakdown by Bank

- **WHEN** the user explores distribution charts
- **THEN** a pie chart illustrates the percentage of total NTD value held within each configured bank grouping.

#### Scenario: Breakdown by Currency

- **WHEN** the user toggles the breakdown view to currency
- **THEN** a pie chart displays the asset allocation spread across USD, NTD, and CNY equivalent holdings.
