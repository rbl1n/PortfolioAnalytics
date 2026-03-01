## ADDED Requirements

### Requirement: Fund Info Shell Page

The system SHALL display a placeholder page for the 基金資料 (Fund Info) tab indicating that this feature is planned for a future update. The page SHALL respect the symbol context and display the selected fund's name if one is selected.

#### Scenario: Viewing Fund Info Tab

- **WHEN** the user navigates to the 基金資料 tab
- **THEN** a placeholder message SHALL be displayed: "基金靜態資料功能建置中，敬請期待"
- **AND** if a fund is currently selected, the fund name SHALL be shown

#### Scenario: No Fund Selected

- **WHEN** the user navigates to the 基金資料 tab with no fund selected
- **THEN** only the placeholder message SHALL be displayed without a fund name
