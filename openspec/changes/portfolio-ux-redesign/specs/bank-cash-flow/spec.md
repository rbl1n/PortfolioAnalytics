## MODIFIED Requirements

### Requirement: Bank Cash Flow Tracking

The system SHALL display the cumulative dividend income (cash flow in) for each bank over time. This chart is now housed within the 庫存分析 (Analysis) Tab instead of the main overview page.

#### Scenario: Dividend Income by Bank

- **WHEN** the user views the cash flow section in the 庫存分析 tab
- **THEN** a stacked bar chart SHALL visualize the total cumulative dividends received per bank across months
- **AND** the chart SHALL respect any active filters from the Watchlist tab
