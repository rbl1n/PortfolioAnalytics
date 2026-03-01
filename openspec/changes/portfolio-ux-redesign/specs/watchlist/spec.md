## ADDED Requirements

### Requirement: Watchlist Table Display

The system SHALL display filtered funds in a table with the following fixed columns: 基金名稱 (Fund Name), 銀行 (Bank), 現值 (Current Value), 實際年化報酬 (Actual Annualized Return, dividend-inclusive, cost-inclusive), 基金表現年化 (Fund Performance Annualized, dividend-inclusive, cost-exclusive), 月趨勢 (Month-over-Month Trend).

#### Scenario: Viewing Watchlist with All Funds

- **WHEN** no filters are applied
- **THEN** the table SHALL display all 20+ funds with their latest month's data
- **AND** each row SHALL be clickable to trigger symbol context navigation

#### Scenario: Annualized Return Color Coding

- **WHEN** a fund's annualized return is positive
- **THEN** the value SHALL be displayed in the up-color (red per Taiwan convention)
- **WHEN** a fund's annualized return is negative
- **THEN** the value SHALL be displayed in the down-color (green per Taiwan convention)

#### Scenario: Trend Indicator Display

- **WHEN** the latest month's trend is "up"
- **THEN** the row SHALL display ▲ in up-color
- **WHEN** the latest month's trend is "down"
- **THEN** the row SHALL display ▼ in down-color
- **WHEN** the latest month's trend is "flat"
- **THEN** the row SHALL display — in neutral color

### Requirement: Tag-Based Multi-Dimension Filtering

The system SHALL provide tag-style filter buttons (not dropdown selects) for the following dimensions: 銀行 (Bank), 幣別 (Currency), 配息類型 (Dividend Type), 投資型態 (Investment Type: 單筆/月扣). Each dimension SHALL have an "全部" (All) tag as default.

#### Scenario: Single Dimension Filter

- **WHEN** the user clicks the "USD" tag in the 幣別 dimension
- **THEN** only funds denominated in USD SHALL be displayed in the Watchlist table
- **AND** the "USD" tag SHALL be visually highlighted as active
- **AND** the "全部" tag SHALL be deactivated

#### Scenario: Multi-Dimension Filter Combination

- **WHEN** the user selects "USD" in 幣別 AND "月" in 配息類型
- **THEN** only funds that are BOTH USD-denominated AND monthly-dividend-paying SHALL be displayed

#### Scenario: Reset to All

- **WHEN** the user clicks the "全部" tag in any dimension
- **THEN** that dimension's filter SHALL be removed and all values for that dimension SHALL be included

### Requirement: Saved Watchlist Presets

The system SHALL allow the user to save the current filter combination as a named watchlist preset. Presets SHALL be stored in localStorage and persist across browser sessions.

#### Scenario: Save Current Filters as Preset

- **WHEN** the user clicks "儲存清單" and enters a name (e.g., "配息基金")
- **THEN** the current filter state SHALL be saved to localStorage with the given name
- **AND** the preset SHALL appear in the watchlist preset selector

#### Scenario: Load a Saved Preset

- **WHEN** the user selects a previously saved preset from the selector
- **THEN** all filter tags SHALL update to match the saved filter state
- **AND** the Watchlist table SHALL refresh to show the filtered results

#### Scenario: Delete a Preset

- **WHEN** the user deletes a saved preset
- **THEN** the preset SHALL be removed from localStorage and the selector

### Requirement: Watchlist Table Sorting

The system SHALL allow the user to sort the Watchlist table by clicking on column headers.

#### Scenario: Sort by Annualized Return

- **WHEN** the user clicks the "實際年化報酬" column header
- **THEN** the table SHALL sort funds by annualized return in descending order
- **WHEN** the user clicks the same header again
- **THEN** the sort order SHALL toggle to ascending
