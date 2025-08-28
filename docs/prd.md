# Repair Management System Brownfield Enhancement PRD (V2.1.0)

## Intro Project Analysis and Context

### Existing Project Overview

The current project (v2.0.0) is a full-stack application for managing a repair and sales business, built with Next.js, tRPC, Prisma, and Tailwind CSS. The existing `reports` page allows users to select a date range but currently lacks a dedicated view for the generated summary.

### Enhancement Scope Definition

#### Enhancement Type
- [x] Major Feature Modification

#### Enhancement Description
This enhancement will introduce a new feature where generating a report no longer creates a PDF file. Instead, it will navigate the user to a new, dedicated web page that displays the summary report directly in the browser. This report page will be styled according to a provided HTML template. All previous PDF-generation logic will be removed.

#### Impact Assessment
- [x] Moderate Impact (some existing code changes)

### Goals and Background Context

#### Goals
- To provide users with an immediate, in-app view of their business summary report without needing to download a file.
- To create a report view with a flexible and aesthetically pleasing layout, similar to a well-designed web page.
- To simplify the technical architecture by removing the complexities of server-side PDF generation.
- To completely remove the `pdf-lib` dependency and all related code from the project.

#### Background Context
The previous goal of generating a PDF proved to be overly complex for the immediate need. A direct, in-browser report page offers a more streamlined user experience and significantly simplifies the development and maintenance workflow. This pivot allows for faster delivery of the core feature: viewing a formatted business summary.

### Change Log

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Revision | 2025-08-28 | 2.1.0 | Pivoted from PDF generation to an HTML report page. | PM |

---

## Requirements

### Functional Requirements
- **FR1**: When a user clicks the "Generate Report" button on the `/reports` page, the application must navigate them to a new report summary page.
- **FR2**: The new report page must accept `startDate` and `endDate` parameters (e.g., via URL query params) to fetch the correct data.
- **FR3**: The report summary page must display sales and repair data corresponding to the selected date range.
- **FR4**: The layout of the report page must adhere to the format specified in the `monthly_report_html_starter_prompt_puppeteer.html` reference file.
- **FR5**: The page must correctly render all text, including Thai characters and vowels.

### Non-Functional Requirements
- **NFR1**: The report page should load the summary data efficiently, displaying a loading state while data is being fetched.
- **NFR2**: The page must be responsive and display correctly on various screen sizes (desktop, tablet, mobile).
- **NFR3**: The "Prompt" font from Google Fonts must be used for rendering text on the page.

### Compatibility Requirements
- **CR1**: The feature must fetch data from the existing `reports.getMonthlySummary` tRPC router without altering its core logic.
- **CR2**: The changes should not negatively impact the functionality of any other part of the application.

---

## User Interface Enhancement Goals

- **Existing UI Integration**: The primary change on the `/reports` page is the functionality of the "Generate Report" button.
- **New Screens**: A new dynamic page route will be created, for example, at `/reports/summary`. This page will contain the full report view.
- **Design Reference**: The layout and styling of the new report page must be based on the provided example file: **`monthly_report_html_starter_prompt_puppeteer.html`**.

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack
- **Languages**: TypeScript
- **Frameworks**: Next.js (App Router), tRPC
- **Database**: PostgreSQL (via Prisma)
- **Styling**: Tailwind CSS

### Integration Approach
1.  **UI Navigation**: The "Generate Report" button on the `/reports` page will be updated. On click, it will use the Next.js `useRouter` hook to navigate to the new summary page (e.g., `/reports/summary?from=...&to=...`), passing the selected dates as URL query parameters.
2.  **New Page Route**: A new page component will be created at `src/app/(main)/reports/summary/page.tsx`.
3.  **Data Fetching**: This new page will be a client component. It will parse the date range from the URL and use the `api.reports.getMonthlySummary.useQuery` tRPC hook to fetch data.
4.  **Component Rendering**: A new `ReportView` component will be created to render the fetched data according to the specified layout. This component will be displayed on the summary page.
5.  **Code Cleanup**: All code related to `pdf-lib` and the previous backend-focused PDF generation logic will be removed.

---

## Epic and Story Structure

### Epic Approach
This enhancement will be consolidated into a single epic focused on replacing the old report generation flow with a new, web-based report view.

### Epic 1: Implement Web-Based Summary Report Page

**Epic Goal**: To provide users with an interactive, in-browser summary report page that displays business data for a selected date range, replacing the previous PDF download functionality.

---

#### Story 1.1: Cleanup Old PDF Generation Logic
**As a** developer,
**I want** to remove all code and dependencies related to the `pdf-lib` implementation,
**so that** the codebase is clean and prepared for the new report view feature.

**Acceptance Criteria**:
1.  The `pdf-lib` package is uninstalled and removed from `package.json`.
2.  The `src/lib/pdf-generator.ts` file and any associated backend logic for creating PDF buffers are completely deleted.
3.  The tRPC procedure previously used for generating the PDF is removed from the `reports` router.

#### Story 1.2: Create the Report Summary Page Route
**As a** developer,
**I want** to create a new, dynamic page for displaying the report,
**so that** users have a dedicated URL to view their generated summary.

**Acceptance Criteria**:
1.  A new page route is created at `src/app/(main)/reports/summary/page.tsx`.
2.  The page component can successfully read `startDate` and `endDate` from the URL query parameters.
3.  The page displays a basic title and a loading indicator while waiting for data.

#### Story 1.3: Develop the Report View Component
**As a** developer,
**I want** to build a reusable React component that renders the report layout,
**so that** it can be used to display the summary data on the new page.

**Acceptance Criteria**:
1.  A new `ReportView` component is created in the `src/components/reports/` directory.
2.  The component's structure and styling are implemented using Tailwind CSS to match the `monthly_report_html_starter_prompt_puppeteer.html` file.
3.  The component can accept summary data (e.g., sales, repairs, overview metrics) as props and render it correctly using mock data.

#### Story 1.4: Integrate Data Fetching on the Report Page
**As a** developer,
**I want** to fetch and display real data on the report summary page,
**so that** the report reflects the user's actual business performance.

**Acceptance Criteria**:
1.  The report summary page uses the `api.reports.getMonthlySummary.useQuery` tRPC hook to fetch data based on the dates from the URL.
2.  A loading state is shown while the query is in progress.
3.  An error state is handled and displayed if the query fails.
4.  Once data is successfully fetched, it is passed to the `ReportView` component, and the complete report is displayed.

#### Story 1.5: Update the Main Reports Page to Navigate
**As a** user,
**I want** to click the "Generate Report" button and be taken to the new summary page,
**so that** I can view my report seamlessly.

**Acceptance Criteria**:
1.  The form on the `/reports` page is updated.
2.  On form submission (clicking the button), the application programmatically navigates to `/reports/summary`, passing the selected `startDate` and `endDate` as URL query parameters.
3.  The old API call for downloading a file is completely removed.