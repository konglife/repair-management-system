# **Component Architecture**

### **Component Refactoring: `src/components/reports/ReportView.tsx`**

The `ReportView.tsx` component will be refactored into a container that orchestrates several smaller, more focused presentational components.

1.  **New Component: `ReportHeader.tsx`**
      - **Responsibility**: Displays the shop information and report date range.
      - **Props**: `shopInfo`, `reportPeriod`.
2.  **New Component: `OverviewMetrics.tsx`**
      - **Responsibility**: Renders the two-column list of the 8 key business metrics as specified in the UI/UX spec.
      - **Props**: `overview`.
3.  **New Component: `SalesTable.tsx`**
      - **Responsibility**: Renders the sales data table, including the new "Sale Items" column and the "Total" footer row. Will contain the logic for summing columns.
      - **Props**: `salesData`.
4.  **New Component: `RepairsTable.tsx`**
      - **Responsibility**: Renders the repairs data table with the "Parts Used" column and "Total" footer row.
      - **Props**: `repairsData`.
5.  **New Component: `PurchasesTable.tsx`**
      - **Responsibility**: Renders the new purchase records table with its "Total" footer row.
      - **Props**: `purchaseData`.

### **Main Page Logic: `src/app/(main)/reports/summary/page.tsx`**

  - This component's core logic remains the same. It will continue to parse URL params and call the `useQuery` hook.
  - It will pass the extended data from the hook down to the refactored `ReportView` component.

-----
