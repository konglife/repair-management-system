# **Repair Management System Brownfield Enhancement Architecture (V2.2.0)**

## **Introduction**

### **Document Purpose**

This document outlines the technical architecture for the v2.2.0 enhancement of the Repair Management System. It provides a detailed plan for modifying the existing backend and frontend components to deliver the improved `/reports/summary` page, ensuring seamless integration with the current system. This plan is based on the provided `prd.md` and `ui-ux-specification.md`.

### **Existing Project Analysis**

The existing system is a robust Next.js application using tRPC for API communication and Prisma as the ORM. The target for this enhancement, the `reports.ts` tRPC router and the `ReportView.tsx` component, are well-structured. The Prisma schema already contains the necessary relations between `Sale`, `Repair`, `Product`, and `PurchaseRecord` models to facilitate the required data fetching. No architectural changes are needed for the database schema itself.

### **Change Log**

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Initial Draft | 2025-08-30 | 1.0 | Technical plan for v2.2.0 report enhancements. | Winston (Architect) |

-----

## **Enhancement Scope and Integration Strategy**

### **Enhancement Overview**

The core of this enhancement is to evolve the existing report generation feature. The technical work involves modifying one tRPC endpoint to be more data-rich and refactoring one primary React component to present this data in a new, document-style format.

### **Integration Approach**

  - **Backend Integration**: The `getMonthlySummary` procedure in the `reportsRouter` will be modified. The existing Prisma query will be expanded to include relations (`saleItems` with `product`, `usedParts` with `product`) and a new query for `purchaseRecord`.
  - **Frontend Integration**: The `ReportView.tsx` component will be refactored. It will be broken down into smaller sub-components for better maintainability (e.g., `ReportHeader`, `OverviewMetrics`, `SalesTable`, `RepairsTable`, `PurchasesTable`). State management will remain local to the `summary/page.tsx` component.

### **Compatibility Requirements**

  - The signature of the `getMonthlySummary` input will not change. The output type will be extended but will remain backward compatible with any existing fields to minimize breaking changes.

-----

## **API Design and Integration (tRPC)**

### **tRPC Router Modification: `src/server/api/routers/reports.ts`**

The `getMonthlySummary` procedure will be updated to perform the following actions:

1.  **Extend Sales Query**: The Prisma query for `sales` will be modified to include related `saleItems` and their corresponding `product` details (specifically the product `name`).
    ```typescript
    // Example Prisma include
    include: {
      saleItems: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    }
    ```
2.  **Extend Repairs Query**: The Prisma query for `repairs` will be modified to include `usedParts` and their `product` details (`name` and `costAtTime`).
    ```typescript
    // Example Prisma include
    include: {
      usedParts: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    }
    ```
3.  **Add Purchase Records Query**: A new query will be added to fetch `purchaseRecord` within the date range, including the related product's name.
4.  **Update Return Type**: The `SummaryData` return type will be updated to include the newly fetched data arrays. For example:
    ```typescript
    interface SaleItemDetail {
      product: { name: string };
    }

    interface UsedPartDetail {
      quantity: number;
      costAtTime: number;
      product: { name: string };
    }

    interface PurchaseRecordDetail {
      // ... fields
      product: { name: string };
    }

    interface SalesData {
      // ... existing fields
      saleItems: SaleItemDetail[];
    }

    interface RepairsData {
        // ... existing fields
        usedParts: UsedPartDetail[];
    }

    interface SummaryData {
      // ... existing fields
      purchaseData: PurchaseRecordDetail[];
    }
    ```

-----

## **Component Architecture**

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

## **Testing Strategy**

### **Backend Testing**

  - **Existing Tests**: Any existing tests for `reports.ts` should be updated to reflect the new data structure in the response.
  - **New Tests**: Add new unit tests to verify:
      - The presence and correctness of `saleItems` and `usedParts` data.
      - The successful fetching and inclusion of `purchaseRecords`.
      - The calculations remain accurate.

### **Frontend Testing**

  - **Component Tests**: Create new tests for each of the new sub-components (`ReportHeader`, `OverviewMetrics`, `SalesTable`, etc.) to ensure they render correctly with mock data.
  - **Integration Test**: Update the test for `summary/page.tsx` to:
      - Mock the new, extended response from the `useQuery` hook.
      - Verify that the main `ReportView` and its new sub-components render the additional data correctly (e.g., check for product names in the table).
      - Verify that the total calculations in the table footers are correct.
  - **Regression Testing**: Manually verify that the main `/reports` page still functions correctly for date selection and navigation.

