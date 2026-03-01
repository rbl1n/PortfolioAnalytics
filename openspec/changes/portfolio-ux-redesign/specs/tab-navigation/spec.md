## ADDED Requirements

### Requirement: Tab-Based Page Navigation

The system SHALL provide a tab bar with 4 tabs: 部位總覽 (Watchlist), 走勢分析 (Chart), 基金資料 (Fund Info), 庫存分析 (Analysis). Only one tab's content SHALL be visible at a time.

#### Scenario: Default Tab on Load

- **WHEN** the user opens the application
- **THEN** the 部位總覽 (Watchlist) tab SHALL be active and its content visible

#### Scenario: Switching Tabs

- **WHEN** the user clicks a tab button
- **THEN** the corresponding tab content SHALL become visible and all other tab contents SHALL be hidden
- **AND** the clicked tab button SHALL be visually highlighted as active

### Requirement: Symbol Context Across Tabs

The system SHALL maintain a global "selected fund" context (symbol context) that persists across tab switches. When a fund is selected in any tab, other tabs SHALL use that fund as their default context.

#### Scenario: Watchlist Click Navigates to Chart

- **WHEN** the user clicks a fund row in the Watchlist tab
- **THEN** the system SHALL set the clicked fund as the active symbol context
- **AND** automatically switch to the 走勢分析 (Chart) tab
- **AND** the Chart tab SHALL display that fund's trend data

#### Scenario: Tab Switch Preserves Context

- **WHEN** the user manually switches to the 基金資料 tab after selecting a fund
- **THEN** the 基金資料 tab SHALL display information for the previously selected fund

#### Scenario: No Fund Selected

- **WHEN** no fund has been selected (initial state or all filtered out)
- **THEN** tabs that require a symbol context SHALL display an empty state message prompting the user to select a fund from the Watchlist

### Requirement: Tab Bar Responsiveness

The tab bar SHALL be responsive and usable on both desktop and mobile devices.

#### Scenario: Mobile Tab Display

- **WHEN** the viewport width is 768px or narrower
- **THEN** the tab bar SHALL remain fully visible with appropriately sized touch targets (minimum 44px height)
