# Repair Management System Brownfield Enhancement PRD (V2.2.0)

## Intro Project Analysis and Context

### Existing Project Overview

The current project (v2.1.0) is a full-stack application for managing a repair and sales business, built with Next.js, tRPC, Prisma, and Tailwind CSS. The existing `/reports/summary` page displays a comprehensive business overview including sales, repairs, and financial metrics within a specified date range.

### Enhancement Scope Definition

#### Enhancement Type
- [x] Major Feature Modification

#### Enhancement Description
This enhancement (v2.2.0) will significantly upgrade the `/reports/summary` page by adding more detailed tables for sales, repairs, and purchase records. It will also introduce summary rows for financial columns and a complete UI redesign of the "Overview" section to present the information in a more professional and document-like format.

#### Impact Assessment
- [x] Moderate Impact (some existing code changes)

### Goals and Background Context

#### Goals
- To provide richer, more detailed data tables for sales, repairs, and purchase records.
- To enhance data readability by adding summary totals to financial columns.
- To significantly improve the user interface of the "Overview" section, giving it a more polished and professional appearance.
- To implement these changes with minimal impact on the existing, stable parts of the system.

### Change Log

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Initial Draft | 2025-08-29 | 2.2.0 | Initial PRD for report page enhancements. | John (PM) |

---

## Requirements

### Functional Requirements
- **FR1**: The Sales data table on the `/reports/summary` page must include a new column, "Sale Items," displaying the names of all products sold in that transaction.
- **FR2**: The Repairs data table must include a new column, "Parts Used," displaying the names and cost of all parts used in that repair.
- **FR3**: A new data table for "Purchase Records" must be added to the page, showing details of items purchased within the date range.
- **FR4**: All data tables (Sales, Repairs, Purchase Records) must include a "Total" row at the bottom that sums up all monetary columns.
- **FR5**: The "Overview" section at the top of the report must be redesigned for a more professional and aesthetically pleasing look, while still presenting the original metrics (Expenses, Total Repairs, etc.).

### Non-Functional Requirements
- **NFR1**: The improved report page must remain performant, with efficient data fetching from the backend.
- **NFR2**: All new UI components must be fully responsive and display correctly on desktop, tablet, and mobile devices.

### Compatibility Requirements
- **CR1**: The feature must continue to fetch data from the existing `reports.getMonthlySummary` tRPC router. Necessary modifications to the router to include additional data (like product names) are permitted, but the core endpoint should be evolved, not replaced.
- **CR2**: The enhancements to the reports page must not negatively impact any other part of the application.

---

## User Interface Enhancement Goals

- **Overview Section Redesign**: The "Overview" display at the top of the report will be completely redesigned. It will move from a simple text list to a more structured, document-like layout using elements like cards, icons, and improved typography to enhance clarity and professional appearance.
- **Enhanced Data Tables**: The "Sales Details" and "Repair Details" tables will be updated to include new columns that provide immediate context about the items involved.
- **New Purchase Table**: A new "Purchase Details" table will be introduced, styled consistently with the other tables.
- **Total Row Implementation**: A summary "Total" row will be added to the bottom of all three tables to provide quick financial summaries for each category.

---

## Epic and Story Structure

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