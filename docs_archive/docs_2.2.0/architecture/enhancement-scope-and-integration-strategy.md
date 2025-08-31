# **Enhancement Scope and Integration Strategy**

### **Enhancement Overview**

The core of this enhancement is to evolve the existing report generation feature. The technical work involves modifying one tRPC endpoint to be more data-rich and refactoring one primary React component to present this data in a new, document-style format.

### **Integration Approach**

  - **Backend Integration**: The `getMonthlySummary` procedure in the `reportsRouter` will be modified. The existing Prisma query will be expanded to include relations (`saleItems` with `product`, `usedParts` with `product`) and a new query for `purchaseRecord`.
  - **Frontend Integration**: The `ReportView.tsx` component will be refactored. It will be broken down into smaller sub-components for better maintainability (e.g., `ReportHeader`, `OverviewMetrics`, `SalesTable`, `RepairsTable`, `PurchasesTable`). State management will remain local to the `summary/page.tsx` component.

### **Compatibility Requirements**

  - The signature of the `getMonthlySummary` input will not change. The output type will be extended but will remain backward compatible with any existing fields to minimize breaking changes.

-----
