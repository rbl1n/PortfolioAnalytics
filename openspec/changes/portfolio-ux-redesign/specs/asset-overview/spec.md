## MODIFIED Requirements

### Requirement: Total Asset Trend Visualization

The system SHALL display a line chart representing the total asset value mapped out month over month. This chart is now housed within the 庫存分析 (Analysis) Tab instead of the main overview page.

#### Scenario: Total Asset Growth

- **WHEN** the user views the 庫存分析 tab
- **THEN** a chart dynamically renders showing the sum of NTD-equivalent total asset value over time (Feb to Dec)
- **AND** the chart SHALL respect any active filters from the Watchlist tab

### Requirement: Asset Distribution Breakdown

The system SHALL provide a proportional breakdown of assets in the 庫存分析 Tab, showing composition by bank, by currency, and by dividend type via toggle buttons.

#### Scenario: Breakdown by Bank

- **WHEN** the user views the distribution chart in the 庫存分析 tab with "依銀行" selected
- **THEN** a pie chart illustrates the percentage of total NTD value held within each configured bank grouping

#### Scenario: Breakdown by Currency

- **WHEN** the user toggles the breakdown view to "依幣別"
- **THEN** a pie chart displays the asset allocation spread across USD, NTD, and CNY equivalent holdings

#### Scenario: Breakdown by Dividend Type

- **WHEN** the user toggles the breakdown view to "依配息類型"
- **THEN** a pie chart displays the asset split between dividend-paying and non-dividend funds
