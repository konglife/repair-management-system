# **Epic and Story Structure**

### **Epic Approach**

All related tasks are consolidated into a single, comprehensive epic to ensure a unified delivery of the v2.3.0 enhancements.

### **Epic 1: UX and Reports Enhancement (v2.3.0)**

**Epic Goal:** To elevate the application's user experience by standardizing data-handling patterns across core modules and to improve the professionalism and accuracy of the reporting feature.

#### **Story 2.3.1: Refactor Sales and Customers Forms for Non-Refreshing Updates**
**As a** user,
**I want** the data tables to update instantly after adding a new sale or customer,
**so that** my workflow is seamless and not interrupted by a page reload.

* **Acceptance Criteria:**
    1.  Upon successful creation of a new sale, the new record appears in the sales table immediately, and the page does not perform a full reload.
    2.  Upon successful creation of a new customer, the new record appears in the customers table immediately, and the page does not perform a full reload.
    3.  The implementation pattern must mirror the `useMutation` and `utils.invalidate()` logic found in the Stock Management module.
    4.  A success toast notification is displayed after each successful submission.

#### **Story 2.3.2: Refine UI of the Summary Report**
**As a** user,
**I want** the summary report to be clean and easy to read,
**so that** I can quickly understand the business performance data.

* **Acceptance Criteria:**
    1.  The "Parts Used" column in the "Details from Repairs" table displays only the part name and quantity (e.g., "Screen x1").
    2.  The date range in the report header is formatted with a hyphen (e.g., "Summary Report 01/08/2025 - 31/08/2025").

#### **Story 2.3.3: Add Company Branding to the Summary Report**
**As a** shop owner,
**I want** my company logo to appear on all reports,
**so that** the documents look official and are branded.

* **Acceptance Criteria:**
    1.  The company logo, as configured in the Settings page, is displayed at the top of the Summary Report.
    2.  The logo is rendered in grayscale.
    3.  The logo is scaled appropriately to fit the document header without causing layout issues.
    4.  If no logo URL is configured in the settings, no broken image or empty space is displayed.