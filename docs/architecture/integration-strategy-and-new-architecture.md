# Integration Strategy and New Architecture

### New Architecture Overview
The new architecture is significantly simplified and follows a standard client-side data fetching pattern within Next.js.
1.  **User Action**: The user fills out the date range on the `/reports` page and clicks "Generate Report".
2.  **Navigation**: The application navigates the user to a new dynamic page (e.g., `/reports/summary`), passing the selected `startDate` and `endDate` as URL query parameters.
3.  **Data Fetching**: The new summary page, a Client Component, reads the dates from the URL and uses a tRPC hook (`useQuery`) to fetch the report data from the existing `getMonthlySummary` procedure.
4.  **UI Rendering**: While the data is loading, a loading state is displayed. Once fetched, the data is passed to a `ReportView` component, which renders the report directly on the page.

### Sequence Diagram
```mermaid
sequenceDiagram
    participant User
    participant Client (Reports Page)
    participant Client (Summary Page)
    participant Server (tRPC API)
    participant Database (Prisma)

    User->>Client (Reports Page): 1. Clicks "Generate Report"
    Client (Reports Page)->>Client (Summary Page): 2. Navigates to `/reports/summary?from=...&to=...`
    Client (Summary Page)->>Server: 3. Calls `reports.getMonthlySummary` tRPC query
    Server->>Database: 4. Fetches summary data
    Database-->>Server: 5. Returns data
    Server-->>Client (Summary Page): 6. Returns data to the client hook
    Client (Summary Page)->>User: 7. Renders the report view with the data