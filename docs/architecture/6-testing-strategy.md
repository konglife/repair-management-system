# 6\. Testing Strategy

  - **Unit Tests**: New UI components (Charts, SearchInput, etc.) and new API utility functions (e.g., PDF generation logic) should have unit tests using Jest and React Testing Library.
  - **Integration Tests**: End-to-end tests using a tool like Playwright or Cypress should be created for the new critical user flows:
    1.  Admin successfully updates settings.
    2.  Admin successfully generates a Sales PDF report for a given month.
  - **Manual Testing**: A full regression test must be performed to ensure that adding search bars, currency inputs, and other enhancements does not break existing CRUD functionalities in Stock, Sales, and Repairs modules.