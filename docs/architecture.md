# Brownfield Enhancement Architecture V2.1.0: HTML Report Page

## Introduction and Analysis

### Enhancement Overview
This document outlines the architectural approach for enhancing the report generation feature within the **Repair Management System**. The primary objective is to pivot from the previous plan of PDF generation. The new goal is to remove all legacy PDF-generation logic (`pdf-lib`) and implement a new feature that displays the summary report on a dedicated web page within the application, rendered from an HTML/CSS template.

### Analysis of Current Architecture (V2.0.0)
A review of the existing project reveals:
* **Structure**: A full-stack application built with Next.js (App Router) utilizing tRPC for the API layer.
* **Database**: Prisma is used as the ORM for managing the PostgreSQL database.
* **Legacy Report System**: The system includes a `reports.ts` tRPC router for fetching summary data and a `src/lib/pdf-generator.ts` utility that will be removed.

### Compatibility Requirements
* **Data Logic**: The new architecture must not alter the data-fetching logic of the existing `reports.getMonthlySummary` tRPC router.
* **UI**: The `/reports` page will be modified to navigate to the new report page instead of triggering a file download.

---

## Integration Strategy and New Architecture

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