# Requirements

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
