## ADDED Requirements

### Requirement: Excel Data Extraction

The system SHALL parse the specified monthly sheets (0228 to 1231) and the "投資贖回損益" sheet from the user-provided Excel file.

#### Scenario: Successful Parsing

- **WHEN** the user uploads or specifies the `理財彙總2025_珊.xlsx` file
- **THEN** the system extracts fund records, including attributes like bank name, fund name, certificate number, currency, current value, and cumulative dividends.

### Requirement: Data Normalization and Structuring

The system SHALL normalize the extracted data into a unified JSON format, handling inconsistencies like varying column counts across months and implicit bank groupings.

#### Scenario: Grouping by Bank

- **WHEN** parsing a monthly sheet with multiple banks separated by empty rows
- **THEN** the system correctly assigns each fund record to its respective bank based on the header rows.

### Requirement: Currency Exchange Rate Application

The system SHALL capture the monthly exchange rates for USD, CNY, and JPY located in Row 2 of each monthly sheet and apply them correctly to calculate NTD-equivalent values where necessary.

#### Scenario: NTD Value Calculation

- **WHEN** calculating the total asset value in NTD
- **THEN** the system uses the specific month's retrieved exchange rate from Row 2 to convert foreign currency funds.
