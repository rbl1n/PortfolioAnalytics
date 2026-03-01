## ADDED Requirements

### Requirement: Single Fund Trend Line Chart

The system SHALL display a line chart showing a single fund's value over the available months. The chart SHALL default to the fund set by the symbol context.

#### Scenario: Viewing Selected Fund Trend

- **WHEN** the user navigates to the 走勢分析 tab with a selected fund
- **THEN** a line chart SHALL display the fund's monthly values across all available months
- **AND** the chart title SHALL include the fund name and currency

### Requirement: Dividend-Inclusive Toggle

The system SHALL provide toggle buttons to switch between dividend-inclusive (含息) and dividend-exclusive (不含息) views for the trend chart.

#### Scenario: Toggle to Dividend-Inclusive

- **WHEN** the user selects the "含息" toggle
- **THEN** the chart SHALL display `profit_loss` values (capital gains + accumulated dividends)

#### Scenario: Toggle to Dividend-Exclusive

- **WHEN** the user selects the "不含息" toggle
- **THEN** the chart SHALL display `profit_loss_ex_div` values (capital gains only)

### Requirement: Multi-Line Comparison

The system SHALL allow the user to add up to 5 funds to the same chart for comparison. Each fund SHALL be rendered as a separate colored line with a legend.

#### Scenario: Adding a Fund for Comparison

- **WHEN** the user selects additional funds from a comparison selector
- **THEN** their trend lines SHALL be added to the chart with distinct colors
- **AND** the legend SHALL list all displayed funds

#### Scenario: Maximum Comparison Limit

- **WHEN** the user attempts to add a 6th fund for comparison
- **THEN** the system SHALL display a message indicating the maximum of 5 lines has been reached

### Requirement: Aggregate Mode

The system SHALL provide an aggregate mode that sums the values of multiple selected funds into a single line, representing a combined portfolio value trend.

#### Scenario: Enabling Aggregate Mode

- **WHEN** the user toggles aggregate mode ON with multiple funds selected
- **THEN** the chart SHALL display a single line representing the summed values of all selected funds
- **AND** the chart title SHALL indicate "加總走勢"

### Requirement: Crosshair (查價線)

The system SHALL display a vertical crosshair line when the user hovers over the chart; all data points at that month SHALL be shown in a tooltip.

#### Scenario: Hover Crosshair Display

- **WHEN** the user hovers over a point on the chart (desktop) or taps a point (mobile)
- **THEN** a vertical line SHALL appear at that month
- **AND** a tooltip SHALL display the value of every visible line at that month

### Requirement: Fund Selector for Chart Tab

The system SHALL provide a fund selector (dropdown or search) within the Chart tab to change the primary displayed fund without returning to the Watchlist tab.

#### Scenario: Changing Primary Fund in Chart

- **WHEN** the user selects a different fund from the chart's fund selector
- **THEN** the chart SHALL update to display the newly selected fund's data
- **AND** the symbol context SHALL be updated
