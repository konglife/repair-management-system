# **Testing Strategy**

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

