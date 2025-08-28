# Epic and Story Structure

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
2.  The component's structure and styling are implemented using Tailwind CSS to match the `monthly_report_html_starter_prompt.html` file.
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