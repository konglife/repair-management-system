# 4\. Component & API Architecture

### 4.1 New Backend Components (API Routes)

New API endpoints will be created to support the new features.

  - **`POST /api/settings`**: To create or update the business profile. (Admin only)
  - **`GET /api/settings`**: To retrieve the current business profile.
  - **`POST /api/reports/sales`**: To generate a monthly sales PDF report. Requires `month` and `year` in the request body. (Admin only)
  - **`POST /api/reports/repairs`**: To generate a monthly repairs PDF report. (Admin only)

### 4.2 New Frontend Components

  - **`/app/(dashboard)/settings/page.tsx`**: A new page and form for managing business settings (FR33, FR34, FR36).
  - **`/app/(dashboard)/reports/page.tsx`**: A new page with controls to select and generate PDF reports (FR29, FR31).
  - **`/components/charts/IncomeExpenseChart.tsx`**: A client component using Recharts to display the income vs. expenses line chart (FR24).
  - **`/components/charts/TopProductsChart.tsx`**: A client component using Recharts to display the top 5 selling products bar chart (FR26).
  - **`/components/dashboard/RecentActivities.tsx`**: A component to fetch and display the latest system activities (FR25).
  - **`/components/dashboard/LowStockAlerts.tsx`**: A component to fetch and display products below the low stock threshold (FR27).
  - **`/components/ui/SearchInput.tsx`**: A reusable search bar component to be implemented on various data tables (FR1, FR9, FR14, FR20).
  - **`/components/ui/CurrencyInput.tsx`**: A reusable input component using `react-number-format` for currency fields (FR3, FR16).

-----
