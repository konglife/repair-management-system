# 4. Technical Assumptions
The technical foundation will remain consistent with the MVP's architecture, as documented in `docs_mvp/architecture.md`. Key new assumptions for V2.0 include:
- **Database**: The Prisma schema will be extended to include a new `BusinessProfile` table to support the Settings feature. This migration must be non-destructive.
- **PDF Generation**: A suitable server-side library (e.g., `pdf-lib` or `Puppeteer`) will be integrated to handle the creation of PDF reports. This process will be an API endpoint.
- **UI Components**: A charting library compatible with React/Next.js (e.g., `Recharts` or `Chart.js`) will be added to render the new graphs on the dashboard.
- **State Management**: Existing state management patterns will be sufficient to handle the new UI interactivity (filters, search).

---
