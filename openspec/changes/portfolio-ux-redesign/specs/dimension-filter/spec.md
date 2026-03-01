## MODIFIED Requirements

### Requirement: Multi-Dimensional Data Filtering

The system SHALL provide tag-style button filters (replacing dropdown selects) allowing users to dynamically filter the portfolio data by multiple dimensions simultaneously. The filters SHALL be located within the 部位總覽 (Watchlist) Tab and their state SHALL affect all tabs.

#### Scenario: Filtering by Bank

- **WHEN** a user clicks a specific bank tag (e.g., "其他")
- **THEN** the Watchlist table and all downstream visualizations SHALL update to show only assets held within that bank

#### Scenario: Filtering by Currency

- **WHEN** a user clicks a specific currency tag (e.g., "USD")
- **THEN** all data and visualizations SHALL reflect only the funds denominated in USD

#### Scenario: Filtering by Dividend Type

- **WHEN** a user clicks the "月" dividend type tag
- **THEN** the system SHALL exclude all funds marked as non-dividend yielding

#### Scenario: Filtering by Investment Type

- **WHEN** a user clicks the "單筆" investment type tag
- **THEN** the system SHALL show only lump-sum investment funds, filtering out monthly-debit (月扣) funds

#### Scenario: Filter State Persistence Across Tabs

- **WHEN** the user sets filters in the Watchlist tab and switches to another tab
- **THEN** the filter state SHALL persist and affect data shown in the destination tab
