# dimension-filter Specification

## Purpose
TBD - created by archiving change portfolio-dashboard-overview. Update Purpose after archive.
## Requirements
### Requirement: Multi-Dimensional Data Filtering

The system SHALL provide an interface allowing users to dynamically filter the visualized portfolio data by multiple dimensions simultaneously.

#### Scenario: Filtering by Bank

- **WHEN** a user selects a specific bank (e.g., "兆豐忠孝") from the filter options
- **THEN** all overview and detail charts update to show only assets held within that bank.

#### Scenario: Filtering by Currency

- **WHEN** a user selects a specific currency (e.g., "USD")
- **THEN** all data and visualizations reflect only the funds denominated in USD.

#### Scenario: Filtering by Dividend Type

- **WHEN** a user filters for "Dividend-Paying" funds
- **THEN** the dashboard excludes all funds marked as non-dividend yielding.

#### Scenario: Time Range Selection

- **WHEN** a user defines a specific time range (e.g., Q3 2025)
- **THEN** charts only plot performance and values across the specified months within that range.

