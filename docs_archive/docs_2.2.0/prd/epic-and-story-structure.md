# Epic and Story Structure

### Epic Approach
This entire enhancement will be managed within a single, focused epic to upgrade the report summary page.

### Epic 1: Enhance Report Summary Page with More Details and Improved UI

**Epic Goal**: To provide users with a more insightful and visually appealing summary report, featuring detailed data tables and a professionally redesigned UI, thereby improving the overall user experience.

---

#### Story 1.1: Extend tRPC Endpoint for Additional Data
**As a** developer,
**I want** to enhance the `reports.getMonthlySummary` tRPC endpoint to include product names for sales/repairs and fetch purchase records,
**so that** the front-end has all the necessary data to render the improved report page in a single call.

**Acceptance Criteria**:
1.  The `getMonthlySummary` response for `salesData` must be updated to include a new property, e.g., `saleItems: { name: string }[]`.
2.  The response for `repairsData` must be updated to include a new property, e.g., `usedParts: { name: string, costAtTime: number }[]`.
3.  The endpoint must fetch and return a new array of `purchaseRecordsData` for the specified date range.
4.  The changes must be backward compatible, not breaking the existing structure that the `ReportView` component currently relies on.

#### Story 1.2: Refactor Data Table Components
**As a** developer,
**I want** to refactor the `ReportView` component to support new columns and a summary total row,
**so that** the tables can display richer data and provide clear financial totals.

**Acceptance Criteria**:
1.  The Sales table within `ReportView` correctly renders the new "Sale Items" column.
2.  The Repairs table correctly renders the new "Parts Used" column, including product names and costs.
3.  A new table for "Purchase Records" is created and correctly displays purchase data.
4.  All three tables dynamically calculate and display a "Total" row for any columns containing monetary values.

#### Story 1.3: Redesign and Implement Overview UI
**As a** user,
**I want** the "Overview" section of my report to have a clean, professional, and modern design,
**so that** I can easily digest the key metrics of my business at a glance.

**Acceptance Criteria**:
1.  The UI for the "Overview" section is refactored from a simple list into a well-designed layout using UI elements like Cards, Icons, or Badges.
2.  The layout is clean, organized, and easy to read.
3.  All 8 key metrics (Expenses, Total Repairs, Sales Profit, etc.) are still displayed clearly.
4.  The new design is fully responsive and looks great on all screen sizes.

#### Story 1.4: Integrate New Data with Enhanced UI
**As a** developer,
**I want** to connect the data from the enhanced tRPC endpoint to the newly refactored UI components,
**so that** the report page is fully functional and displays complete, accurate information.

**Acceptance Criteria**:
1.  The `reports/summary/page.tsx` correctly calls the enhanced `getMonthlySummary` endpoint.
2.  The new `saleItems` and `usedParts` data is passed to and rendered correctly in the respective tables.
3.  The new `purchaseRecordsData` is displayed in its dedicated table.
4.  The redesigned "Overview" UI correctly displays the key metrics from the API.