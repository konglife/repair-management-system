# Technical Constraints and Integration Requirements

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
